import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import PageLayout from "@/components/PageLayout"
import AIEditor from "./AIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { versionStore } from "./store/versionStore"
import { CodeItem } from "./AIEditor/type"

const MAX_MESSAGES = 10

export const extractShataAIFormContent = (content: string): string => {
  if (!content) {
    return ""
  }
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content?.match(regex)
  return match ? match[1].trim() : content
}

const wrapWithShataAIForm = (content: string): string => {
  return `<shata-ai-code>\n${content}\n</shata-ai-code>`
}

const AppBuilder: React.FC = observer(() => {
  const { appId } = useParams<{ appId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<AppBuilderMessage[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [appTitle, setAppTitle] = useState("")
  const { updateBreadcrumbs } = useBreadcrumb()
  const [showPublishModal, setShowPublishModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCodeId, setSelectedCodeId] = useState<string>("app_entry")
  const [codeItems, setCodeItems] = useState<CodeItem[]>([])

  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
      { label: "应用开发", href: "" },
    ])
  }, [])

  useEffect(() => {
    if (appId) {
      versionStore.setAppId(appId)
      loadInitialData()
    }
  }, [appId])

  useEffect(() => {
    updateCodeItems()
  }, [versionStore.currentVersion])

  // 在 loadInitialData 成功后更新
  const loadInitialData = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      const result = await getMetadata(["app_index"])
      const apps = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : []
      const app = apps.find((a: any) => a.id === appId)
      if (app) {
        setAppTitle(app.title)
      }
      await versionStore.loadApp(appId)
      updateCodeItems() // 添加这行
    } catch (error) {
      console.error("Error loading initial data:", error)
      message.error("加载应用数据失败")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPreview = useCallback(() => {
    if (iframeRef.current && !isRefreshing) {
      setIsRefreshing(true)
      iframeRef.current.src = iframeRef.current.src
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }, [isRefreshing])

  const updateCodeItems = useCallback(() => {
    const currentVersion = versionStore.currentVersion
    if (!currentVersion) return

    const items: CodeItem[] = []
    if (currentVersion.content) {
      items.push({
        id: "app_entry",
        title: "应用入口 (App Entry)",
        type: "app",
        code: currentVersion.content,
        updatedAt: currentVersion.appState?.updatedAt,
      })
    }

    if (currentVersion.appState?.pages) {
      Object.entries(currentVersion.appState.pages).forEach(([pageId, page]) => {
        items.push({
          id: pageId,
          title: `${page.title} (${pageId})`,
          type: "page",
          code: page.code,
          updatedAt: page.updatedAt,
        })
      })
    }

    setCodeItems(items)
    if (items.length > 0 && !selectedCodeId) {
      setSelectedCodeId(items[0].id)
    }
  }, [selectedCodeId])

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data.type === "preview_ready" && event.data.appId === appId) {
        const currentVersion = versionStore.currentVersion
        if (currentVersion?.content) {
          const targetWindow = event.source as Window
          targetWindow.postMessage(
            {
              type: "update_preview",
              appId,
              code: currentVersion.content,
            },
            "*"
          )
        }
      } else if (event.data.type === "request_page_code" && event.data.appId === appId) {
        const { pageId } = event.data
        const pageCode = versionStore.getPageCode(pageId)

        const iframe = document.querySelector("iframe")
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: "update_page_code",
              appId,
              pageId,
              code: pageCode,
            },
            "*"
          )
        }
      }
    },
    [appId]
  )

  useEffect(() => {
    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [handleMessage])

  const handleCommandResult = useCallback(
    (result: any) => {
      console.log("Handling command result:", result)

      if (!result.success) {
        message.error(result.error || "操作失败")
        return
      }

      try {
        const currentVersion = versionStore.currentVersion
        console.log("Current version before update:", currentVersion)

        if (!currentVersion) {
          console.log("First time generation, creating initial version")
          versionStore.addVersion(result.appCode, {
            pages: result.pages || {},
            version: 1,
            updatedAt: new Date().toISOString(),
          })
        } else {
          const updatedPages = { ...currentVersion.appState?.pages }
          if (result.pages) {
            Object.entries(result.pages).forEach(([pageId, pageData]) => {
              updatedPages[pageId] = {
                code: pageData.code,
                title: pageData.title,
                updatedAt: new Date().toISOString(),
              }
            })
          }

          versionStore.addVersion(result.appCode || currentVersion.content, {
            pages: updatedPages,
            version: (currentVersion.appState?.version || 0) + 1,
            updatedAt: new Date().toISOString(),
          })
        }

        console.log("Current version after update:", versionStore.currentVersion)

        updateLastMessage({ status: "success" })

        const iframe = document.querySelector("iframe")
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: "update_preview",
              appId,
              code: result.appCode || currentVersion?.content,
            },
            "*"
          )
        }
      } catch (error) {
        console.error("Error in handleCommandResult:", error)
        message.error("处理结果时发生错误")
      }
    },
    [appId]
  )

  const handlePublish = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      const publishData = versionStore.exportForPublish()
      if (!publishData) {
        throw new Error("没有可发布的内容")
      }

      for (const [pageId, page] of Object.entries(publishData.pages)) {
        await setMetadata(
          pageId,
          JSON.stringify({
            id: pageId,
            title: page.title,
            code: page.code,
            appId,
            updatedAt: page.updatedAt,
          })
        )
      }

      await setMetadata(
        `app_${appId}`,
        JSON.stringify({
          code: publishData.appCode,
          updatedAt: publishData.updatedAt,
          version: publishData.version,
        })
      )

      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const appIndex = apps.findIndex((a: any) => a.id === appId)
      if (appIndex === -1) throw new Error("应用不存在")

      const updatedApps = [...apps]
      updatedApps[appIndex] = {
        ...updatedApps[appIndex],
        updatedAt: new Date().toISOString(),
        status: "active",
        version: publishData.version,
        lastPublishedAt: new Date().toISOString(),
      }

      await setMetadata("app_index", JSON.stringify(updatedApps))

      versionStore.clear()
      message.success("发布成功")
      setShowPublishModal(true)
    } catch (error) {
      console.error("Error publishing app:", error)
      message.error("发布失败")
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = useCallback((message: AppBuilderMessage) => {
    setMessages((prev) => {
      const updatedMessages = [...prev, message]
      if (updatedMessages.length > MAX_MESSAGES) {
        const systemMessages = updatedMessages.filter((msg) => msg.role === "system")
        const nonSystemMessages = updatedMessages.filter((msg) => msg.role !== "system")
        const recentMessages = nonSystemMessages.slice(-MAX_MESSAGES + systemMessages.length)
        return [...systemMessages, ...recentMessages]
      }
      return updatedMessages
    })
  }, [])

  const updateLastMessage = useCallback((update: Partial<AppBuilderMessage>) => {
    setMessages((prev) => {
      const messages = [...prev]
      const lastIndex = messages.length - 1
      if (lastIndex >= 0) {
        messages[lastIndex] = {
          ...messages[lastIndex],
          ...update,
        }
      }
      return messages
    })
  }, [])

  const handleChunk = useCallback(
    (chunk: string) => {
      accumulatedTextRef.current += chunk
      if (accumulatedTextRef.current !== "") {
        updateLastMessage({
          content: accumulatedTextRef.current,
          status: "streaming",
        })
      }
    },
    [updateLastMessage]
  )

  const handleStop = useCallback(() => {
    updateLastMessage({
      status: "cancelled",
      content: accumulatedTextRef.current || "生成已停止",
    })
  }, [updateLastMessage])

  const handleClearMessages = () => {
    setMessages([])
    accumulatedTextRef.current = ""
    currentMessageIdRef.current = null
  }

  const processCommand = async (command: string) => {
    const userMessage: AppBuilderMessage = {
      role: "user",
      content: command,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    }
    addMessage(userMessage)

    const assistantMessage: AppBuilderMessage = {
      role: "assistant",
      content: "",
      id: (Date.now() + 1).toString(),
      timestamp: new Date().toLocaleTimeString(),
      status: "thinking",
    }
    addMessage(assistantMessage)

    accumulatedTextRef.current = ""
    currentMessageIdRef.current = assistantMessage.id

    try {
      const result = await AppAgent.processCommand(appId, messages, command, handleChunk)
      return result
    } catch (error) {
      console.error("Error in chat:", error)
      updateLastMessage({
        content: error instanceof Error ? error.message : "处理过程中发生错误",
        status: "error",
      })
      throw error
    } finally {
      currentMessageIdRef.current = null
    }
  }

  const renderPreview = useCallback(() => {
    const version = versionStore.currentVersion
    if (!version?.content) {
      return (
        <div className='flex flex-col items-center justify-center min-h-[400px] bg-default-50'>
          <Icon icon='mdi:apps' className='w-16 h-16 text-default-300' />
          <p className='mt-4 text-default-500'>请先生成应用代码</p>
        </div>
      )
    }

    return (
      <div className='relative w-full h-full'>
        <div className='absolute top-2 right-2 z-10 flex gap-2'>
          <Button
            size='sm'
            variant='flat'
            color='primary'
            isIconOnly
            onClick={() => {
              window.open(`/app-preview/${appId}`, "_blank")
            }}
            className='bg-white/70 backdrop-blur-sm'
          >
            <Icon icon='mdi:open-in-new' className='w-4 h-4' />
          </Button>
          {isRefreshing && (
            <div className='flex items-center gap-1 px-2 py-1 text-xs text-default-600 bg-white/70 backdrop-blur-sm rounded-lg'>
              <Icon icon='mdi:refresh' className='w-4 h-4 animate-spin' />
              刷新中...
            </div>
          )}
        </div>
        <iframe
          ref={iframeRef}
          src={`/app-preview/${appId}`}
          style={{
            width: "100%",
            height: "500px",
            border: "none",
            borderRadius: "8px",
          }}
          title='App Preview'
          allowFullScreen
        />
      </div>
    )
  }, [appId, isRefreshing])

  if (!appId) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <Icon icon='mdi:alert' className='w-12 h-12 text-danger mb-2' />
          <p className='text-danger'>无效的应用ID</p>
        </div>
      </div>
    )
  }

  const pageActions = (
    <Button
      color='primary'
      onClick={handlePublish}
      isDisabled={isLoading}
      isLoading={isLoading}
      startContent={<Icon icon='mdi:rocket-launch' className='w-4 h-4' />}
    >
      发布应用
    </Button>
  )

  return (
    <PageLayout title={`构建应用 - ${appTitle}`} titleIcon='mdi:tools' actions={pageActions}>
      <div className='h-[calc(100vh-140px)] overflow-auto'>
        <AIEditor
          parseConfig={async (code: string) => ({ code })}
          messages={messages}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          agent={{
            processCommand,
          }}
          renderPreview={renderPreview}
          onCommandResult={handleCommandResult}
          handleClearMessages={handleClearMessages}
          onStop={handleStop}
          showCodeTab
          previewTabName='应用预览'
          codeItems={codeItems}
          selectedCodeId={selectedCodeId}
          onCodeSelect={setSelectedCodeId}
        />
      </div>

      <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>发布成功</ModalHeader>
          <ModalBody>
            <p>应用已成功发布！您可以通过以下链接访问：</p>
            <div className='flex items-center gap-2 p-2 bg-default-100 rounded'>
              <code className='text-sm'>/app-run/{appId}</code>
              <Button
                size='sm'
                variant='flat'
                onClick={() => window.open(`/app-run/${appId}`, "_blank")}
                startContent={<Icon icon='mdi:open-in-new' className='w-4 h-4' />}
              >
                查看应用
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={() => setShowPublishModal(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
})

export default AppBuilder
