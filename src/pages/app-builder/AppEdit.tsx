import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import AIEditor from "./AIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { useVersionControl } from "./hooks/useVersionControl"
import { versionStore } from "./store/versionStore"
import { CodeItem } from "./AIEditor/type"

const AppBuilder: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<AppBuilderMessage[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [appTitle, setAppTitle] = useState("")
  const { updateBreadcrumbs } = useBreadcrumb()
  const versionControl = useVersionControl()
  const [showPublishModal, setShowPublishModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCodeId, setSelectedCodeId] = useState<string>("")
  const [codeItems, setCodeItems] = useState<CodeItem[]>([])

  // 添加 refs 用于跟踪消息状态
  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
      { label: "应用开发", href: "" },
    ])
  }, [])

  // 添加刷新预览函数
  const refreshPreview = useCallback(() => {
    if (iframeRef.current && !isRefreshing) {
      setIsRefreshing(true)
      iframeRef.current.src = iframeRef.current.src
      setTimeout(() => setIsRefreshing(false), 500) // 防抖
    }
  }, [isRefreshing])

  // 监听版本变化
  useEffect(() => {
    const unsubscribe = versionStore.subscribeToHistory(() => {
      refreshPreview()
    })
    return () => unsubscribe()
  }, [refreshPreview])

  // 初始化代码列表
  useEffect(() => {
    const currentContent = versionStore.getCurrentContent()
    const appCache = appId ? JSON.parse(localStorage.getItem(`app_cache_${appId}`) || "{}") : {}

    const items: CodeItem[] = []

    // 添加应用入口代码
    if (currentContent) {
      items.push({
        id: "app_entry",
        title: "应用入口 (App Entry)",
        type: "app",
        code: currentContent,
        updatedAt: appCache.updatedAt,
      })
    }

    // 添加页面代码
    if (appCache.pages) {
      Object.entries(appCache.pages).forEach(([pageId, page]: [string, any]) => {
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
    if (items.length > 0) {
      setSelectedCodeId(items[0].id)
    }
  }, [appId, versionControl.currentIndex])

  // 加载应用数据
  useEffect(() => {
    const loadAppData = async () => {
      if (!appId) return
      try {
        setIsLoading(true)
        await AppAgent.loadAppCache(appId)

        // 获取应用标题
        const result = await getMetadata(["app_index"])
        const apps = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : []
        const app = apps.find((a: any) => a.id === appId)
        if (app) {
          setAppTitle(app.title)
        }

        // 加载初始版本
        const appCache = AppAgent.getAppCache(appId)
        if (appCache?.appCode) {
          versionStore.addVersion(appCache.appCode, {
            pages: appCache.pages,
            version: appCache.version,
            updatedAt: appCache.updatedAt,
          })
        }
      } catch (error) {
        console.error("Error loading app data:", error)
        message.error("加载应用数据失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadAppData()
  }, [appId])

  // 添加消息处理函数
  const addMessage = useCallback((message: AppBuilderMessage) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // 更新最后一条消息
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

  // 处理数据块
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

  // 处理停止生成
  const handleStop = useCallback(() => {
    updateLastMessage({
      status: "cancelled",
      content: accumulatedTextRef.current || "生成已停止",
    })
  }, [updateLastMessage])

  const handleCommandResult = useCallback(
    (result: any) => {
      if (!result.success) {
        message.error(result.error || "操作失败")
        return
      }

      try {
        const appCache = AppAgent.getAppCache(appId!)
        if (!appCache) return

        const updatedPages = { ...appCache.pages }
        if (result.pages) {
          Object.entries(result.pages).forEach(([pageId, pageData]) => {
            updatedPages[pageId] = {
              code: pageData.code,
              title: pageData.title,
              updatedAt: new Date().toISOString(),
            }
          })
        }

        // 更新应用缓存
        const newAppCache = {
          ...appCache,
          pages: updatedPages,
          version: appCache.version + 1,
          updatedAt: new Date().toISOString(),
        }

        // 如果有新的应用代码，更新appCode
        if (result?.appCode && result.appCode !== "") {
          newAppCache.appCode = result.appCode
        }

        // 添加新版本
        versionStore.addVersion(newAppCache.appCode || versionStore.getCurrentContent(), {
          pages: newAppCache.pages,
          version: newAppCache.version,
          updatedAt: newAppCache.updatedAt,
        })

        // 更新缓存
        AppAgent.setAppCache(appId!, newAppCache)

        // 更新最后一条消息状态为成功
        updateLastMessage({ status: "success" })

        // 更新代码列表
        const items: CodeItem[] = [
          {
            id: "app_entry",
            title: "应用入口 (App Entry)",
            type: "app",
            code: newAppCache.appCode,
            updatedAt: newAppCache.updatedAt,
          },
          ...Object.entries(updatedPages).map(([pageId, page]) => ({
            id: pageId,
            title: `${page.title} (${pageId})`,
            type: "page" as const,
            code: page.code,
            updatedAt: page.updatedAt,
          })),
        ]
        setCodeItems(items)

        // 刷新预览
        refreshPreview()
      } catch (error) {
        console.error("Error in handleCommandResult:", error)
        message.error("处理结果时发生错误")
      }
    },
    [appId, updateLastMessage, refreshPreview]
  )

  const handlePublish = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      const appCache = AppAgent.getAppCache(appId)
      if (!appCache) {
        throw new Error("应用缓存不存在")
      }

      // 1. 更新所有页面
      for (const [pageId, page] of Object.entries(appCache.pages)) {
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

      // 2. 更新应用代码
      await setMetadata(
        `app_${appId}`,
        JSON.stringify({
          code: appCache.appCode,
          updatedAt: new Date().toISOString(),
          version: appCache.version,
        })
      )

      // 3. 更新应用索引
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const appIndex = apps.findIndex((a: any) => a.id === appId)
      if (appIndex === -1) throw new Error("应用不存在")

      const updatedApps = [...apps]
      updatedApps[appIndex] = {
        ...updatedApps[appIndex],
        updatedAt: new Date().toISOString(),
        status: "active",
        version: appCache.version,
        lastPublishedAt: new Date().toISOString(),
      }

      await setMetadata("app_index", JSON.stringify(updatedApps))
      message.success("发布成功")
      setShowPublishModal(true)
    } catch (error) {
      console.error("Error publishing app:", error)
      message.error("发布失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearMessages = () => {
    setMessages([])
    accumulatedTextRef.current = ""
    currentMessageIdRef.current = null
  }

  // 处理 AI 命令
  const processCommand = async (command: string) => {
    // 添加用户消息
    const userMessage: AppBuilderMessage = {
      role: "user",
      content: command,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    }
    addMessage(userMessage)

    // 添加 AI 思考消息
    const assistantMessage: AppBuilderMessage = {
      role: "assistant",
      content: "",
      id: (Date.now() + 1).toString(),
      timestamp: new Date().toLocaleTimeString(),
      status: "thinking",
    }
    addMessage(assistantMessage)

    // 重置累积文本
    accumulatedTextRef.current = ""
    currentMessageIdRef.current = assistantMessage.id

    try {
      const result = await AppAgent.processCommand(appId!, messages, command, handleChunk)
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
    const currentContent = versionStore.getCurrentContent()
    if (!currentContent) {
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
  }, [isRefreshing])

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
          versionControl={versionControl}
          renderPreview={renderPreview}
          onCommandResult={handleCommandResult}
          onClearMessages={handleClearMessages}
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
}

export default AppBuilder
