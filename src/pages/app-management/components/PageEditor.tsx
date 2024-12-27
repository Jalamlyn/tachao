import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useVersionControl } from "@/hooks/useVersionControl"
import AIEditor from "@/components/AIEditor"
import { PageRenderer } from "@/components/PageRenderer"
import AIPageAgent from "@/service/agents/AIPageAgent"
import { useAppStore } from "../store/useAppStore"
import { getPageAgent } from "./getPageAgent"

const PageEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { appId } = useParams<{ appId: string }>()
  const { isHome } = location.state || {}
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const { update: updateApp } = useMetadata("app")
  const { useApps } = useAppStore()
  const { apps } = useApps()
  const app = apps.find((a) => a.id === appId)

  // refs 用于跟踪消息状态
  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  // 页面状态管理
  const [pageState, setPageState] = useState({
    rawCode: null as string | null,
    previewContent: "",
  })

  // 设置预览内容
  const setPreviewContent = useCallback((content: string) => {
    setPageState((prev) => ({
      ...prev,
      previewContent: content,
    }))
  }, [])

  // 处理数据块
  const handleChunk = useCallback((chunk: string) => {
    accumulatedTextRef.current += chunk
    if (accumulatedTextRef.current !== "") {
      updateLastMessage({
        content: accumulatedTextRef.current,
        status: "streaming",
      })
    }
  }, [])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
      { label: app?.title || "应用", href: `/we-chat-app/admin/apps/${appId}` },
      { label: isHome ? "创建首页" : "创建页面", href: "" },
    ])
  }, [])

  // 更新最后一条消息
  const updateLastMessage = useCallback((update: Partial<any>) => {
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

  // 添加消息
  const addMessage = useCallback((message: any) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // 创建 pageAgent
  const pageAgent = useMemo(() => {
    return getPageAgent(
      addMessage,
      setPreviewContent,
      accumulatedTextRef,
      currentMessageIdRef,
      messages,
      handleChunk,
      pageState,
      updateLastMessage
    )
  }, [messages, pageState, addMessage, setPreviewContent, handleChunk, updateLastMessage])

  // 初始化 versionControl
  const versionControl = useVersionControl({
    initialVersions: [],
    maxVersions: 10,
  })

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
      { label: app?.title || "应用", href: `/we-chat-app/admin/apps/${appId}` },
      { label: isHome ? "创建首页" : "创建页面", href: "" },
    ])
  }, [])

  const handleSave = async () => {
    if (!appId) return

    try {
      setIsLoading(true)
      const currentVersion = versionControl.getCurrentVersion()
      if (!currentVersion?.code) {
        message.error("请先生成页面代码")
        return
      }

      await updateApp(appId, {
        pages: [
          {
            id: `page_${Date.now()}`,
            code: currentVersion.code,
            isHome: isHome || false,
          },
        ],
      })

      message.success("保存成功")
      navigate(`/apps/${appId}`)
    } catch (error) {
      console.error("Save error:", error)
      message.error("保存失败")
    } finally {
      setIsLoading(false)
    }
  }

  // 修改: 更新 handleCommandResult，添加 pageState 更新
  const handleCommandResult = (result: any) => {
    if (result.success && result.code) {
      // 更新 pageState
      setPageState((prev) => ({
        ...prev,
        rawCode: result.code,
        previewContent: result.code,
      }))

      // 更新版本控制
      versionControl.addVersion({
        code: result.code,
      })
    }
  }

  const pageActions = (
    <Button
      color='primary'
      onClick={handleSave}
      isDisabled={isLoading}
      isLoading={isLoading}
      startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
    >
      保存页面
    </Button>
  )

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

  return (
    <PageLayout title={isHome ? "创建首页" : "创建页面"} titleIcon='mdi:file-document-edit' actions={pageActions}>
      <div className='h-[calc(100vh-200px)] overflow-auto'>
        <AIEditor
          parseConfig={AIPageAgent.parseCode}
          messages={messages}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          agent={pageAgent}
          versionControl={versionControl}
          onCommandResult={handleCommandResult}
          renderPreview={(version) => (
            <ErrorBoundary>
              <PageRenderer code={version?.code} />
            </ErrorBoundary>
          )}
          showCodeTab
          previewTabName='页面预览'
        />
      </div>
    </PageLayout>
  )
}

export default PageEditor
