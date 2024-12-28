import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import AIEditor from "@/components/AIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { useVersionControl } from "@/hooks/useVersionControl"

const AppBuilder: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<AppBuilderMessage[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [appTitle, setAppTitle] = useState("")
  const { updateBreadcrumbs } = useBreadcrumb()

  // 添加版本控制
  const versionControl = useVersionControl({
    initialVersions: [],
    maxVersions: 10,
  })

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
        if (appCache) {
          versionControl.addVersion({
            rawConfig: appCache.appCode,
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

  const handleCommandResult = useCallback(
    (result: any) => {
      if (!result.success) {
        message.error(result.error || "操作失败")
        return
      }

      const appCache = AppAgent.getAppCache(appId!)
      if (!appCache) return

      const updatedPages = { ...appCache.pages }
      if (result.pages) {
        Object.entries(result.pages).forEach(([pageId, pageData]) => {
          // 直接添加/更新页面，不需要检查是否存在
          updatedPages[pageId] = {
            code: pageData.code,
            title: pageData.title,
            updatedAt: new Date().toISOString(),
          }
        })
      }

      // 添加新版本
      versionControl.addVersion({
        appCode: result.appCode || appCache.appCode,
        pages: updatedPages,
      })

      // 更新缓存
      AppAgent.setAppCache(appId!, {
        ...appCache,
        pages: updatedPages,
        appCode: result.appCode || appCache.appCode,
        version: appCache.version + 1,
        updatedAt: new Date().toISOString(),
      })

      // 更新最后一条消息状态为成功
      updateLastMessage({ status: "success" })
    },
    [appId, updateLastMessage, versionControl]
  )

  const handleSave = async () => {
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

      // 2. 更新应用索引
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const appIndex = apps.findIndex((a: any) => a.id === appId)
      if (appIndex === -1) throw new Error("应用不存在")

      const updatedApps = [...apps]
      updatedApps[appIndex] = {
        ...updatedApps[appIndex],
        updatedAt: new Date().toISOString(),
      }

      await setMetadata("app_index", JSON.stringify(updatedApps))
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving app:", error)
      message.error("保存失败")
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
    const currentVersion = versionControl.getCurrentVersion()
    if (!currentVersion?.appCode) {
      return (
        <div className='flex flex-col items-center justify-center min-h-[400px] bg-default-50'>
          <Icon icon='mdi:apps' className='w-16 h-16 text-default-300' />
          <p className='mt-4 text-default-500'>请先生成应用代码</p>
        </div>
      )
    }

    return (
      <iframe
        src={`/preview/${appId}`}
        style={{
          width: "100%",
          height: "500px",
          border: "none",
          borderRadius: "8px",
        }}
        title='App Preview'
      />
    )
  }, [versionControl, appId])

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
      onClick={handleSave}
      isDisabled={isLoading}
      isLoading={isLoading}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
    >
      保存应用
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
          showCodeTab
          previewTabName='应用预览'
        />
      </div>
    </PageLayout>
  )
}

export default AppBuilder
