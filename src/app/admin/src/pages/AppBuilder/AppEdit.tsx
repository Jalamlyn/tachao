import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useLocation } from "react-router-dom"
import { Button, ButtonGroup, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import PageLayout from "@/app/admin/src/components/PageLayout"
import AIEditor from "./AIEditor/AppAIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage, CodeItem } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { appCodeStore } from "./store/appCodeStore"
import { logStore } from "./AIEditor/components/LogStore"
import { requestStore } from "./AIEditor/components/RequestStore"
import { ErrorPrompt, PublishModal, PublishTemplateModal, RollbackModal } from "./AppEditErrorPrompt"
import { SaveVersionModal, VersionListModal } from "./AppEditModal"

const MAX_MESSAGES = 10

const AppBuilder: React.FC = observer(() => {
  const { appId } = useParams<{ appId: string }>()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [messages, setMessages] = useState<AppBuilderMessage[]>([])
  const [selectedTab, setSelectedTab] = useState("preview")
  const [appTitle, setAppTitle] = useState("")
  const { updateBreadcrumbs } = useBreadcrumb()
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showPublishTemplateModal, setShowPublishTemplateModal] = useState(false)
  const [showRollbackModal, setShowRollbackModal] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [publishInProgress, setPublishInProgress] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState(null)
  const [isCompiling, setIsCompiling] = useState(false)

  // 新增: 版本管理相关状态
  const [showSaveVersionModal, setShowSaveVersionModal] = useState(false)
  const [showVersionListModal, setShowVersionListModal] = useState(false)
  const [versions, setVersions] = useState([])

  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "应用管理", href: "/admin/apps" },
      { label: "应用开发", href: "" },
    ])
  }, [])

  useEffect(() => {
    return () => {
      appCodeStore.clearViewState()
    }
  }, [])
  const handlePullVersion = async (versionInfo) => {
    try {
      setIsLoading(true)
      await appCodeStore.pullVersion(versionInfo)
      setShowVersionListModal(false)
      refreshPreview()
      message.success("代码拉取成功")
    } catch (error) {
      console.error("Error pulling version:", error)
      message.error(error instanceof Error ? error.message : "拉取失败")
    } finally {
      setIsLoading(false)
    }
  }

  // 添加日志和请求消息监听
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "AI_FIX_REQUEST") {
        const errorInfo = event.data.payload
        const fixPrompt = `请帮我修复以下错误:
          错误信息: ${errorInfo.error}
          路由路径: ${errorInfo.context?.route}
          ${errorInfo.context?.type === "module_error" ? "这是一个模块执行错误。" : ""}
          用户操作: ${errorInfo.context?.userOperations}
          出问题的模块: ${errorInfo.context?.moduleName}

          请根据用户操作，路由路径，错误信息，模块名称分析并定位错误原因并生成修复后的完整代码, 每个模块的代码都必须完整, 不能用注释省略任何部分。无论是多小的修改都要给出整个模块的完整代码，如果是模块导入超时的错误，你要检查下所有导入的模块是否都正确实现并导出`

        processCommand(fixPrompt)
      } else if (event.data.type === "LOG") {
        const { level, message, details } = event.data
        logStore[level](message, details)
      } else if (event.data.type === "LOG_CLEAR") {
        logStore.clear()
      } else if (event.data.type === "REQUEST") {
        // 处理请求数据
        const { method, params, response } = event.data
        requestStore.addRequest({
          method,
          params,
          response,
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  useEffect(() => {
    const initEditor = async () => {
      if (!appId) return

      try {
        setIsLoading(true)

        const version = await appCodeStore.loadApp(appId)

        if (version?.app?.name) {
          setAppTitle(version.app.name)
        }

        // 新增: 加载版本历史
        const history = await appCodeStore.getAppVersionHistory()
        setVersions(history.versions)

        if (!selectedTab) {
          setSelectedTab("preview")
        }
      } catch (error) {
        console.error("Error initializing editor:", error)
        message.error("加载应用失败")
      } finally {
        setIsLoading(false)
      }
    }

    initEditor()
  }, [appId])

  const handleDeleteVersion = async (versionInfo) => {
    try {
      setIsLoading(true)
      await appCodeStore.deleteAppVersion(versionInfo.id, versionInfo.versionCode)
      // 更新版本列表
      const history = await appCodeStore.getAppVersionHistory()
      setVersions(history.versions)
    } catch (error) {
      message.error("删除版本失败: " + error.message)
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

  // 新增: 保存版本处理函数
  const handleSaveVersion = async (name: string, description: string) => {
    try {
      const versionInfo = await appCodeStore.saveAppVersion(name, description)
      message.success("版本保存成功")
      // 更新版本列表
      const history = await appCodeStore.getAppVersionHistory()
      setVersions(history.versions)
    } catch (error) {
      throw error
    }
  }

  // 新增: 从特定版本发布
  const handlePublishFromVersion = async (versionInfo) => {
    try {
      setIsLoading(true)
      setPublishInProgress(true)
      setPublishError(null)

      await appCodeStore.publishFromVersion(versionInfo)
      setShowVersionListModal(false)
      refreshPreview()
    } catch (error) {
      console.error("Error publishing version:", error)
      setPublishError(error instanceof Error ? error.message : "发布失败")
      message.error(error instanceof Error ? error.message : "发布失败")
    } finally {
      setIsLoading(false)
      setPublishInProgress(false)
    }
  }

  const handlePublish = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      setPublishInProgress(true)
      setPublishError(null)

      const result = await appCodeStore.publishToServer({
        useLatest: !appCodeStore.isViewingHistory,
      })

      if (result.publishInfo.hasNewerVersion) {
        message.info(`已发布${result.publishInfo.versionDate}的版本，` + "但存在更新的版本未发布")
      }

      setShowPublishModal(true)
    } catch (error) {
      console.error("Error publishing app:", error)
      setPublishError(error instanceof Error ? error.message : "发布失败")
      message.error(error instanceof Error ? error.message : "发布失败")
    } finally {
      setIsLoading(false)
      setPublishInProgress(false)
    }
  }

  const handlePublishTemplate = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      setPublishInProgress(true)
      setPublishError(null)

      const result = await appCodeStore.publishTemplate({
        useLatest: !appCodeStore.isViewingHistory,
      })

      setShowPublishTemplateModal(true)
    } catch (error) {
      console.error("Error publishing template:", error)
      setPublishError(error instanceof Error ? error.message : "发布失败")
      message.error(error instanceof Error ? error.message : "发布失败")
    } finally {
      setIsLoading(false)
      setPublishInProgress(false)
    }
  }

  const handleRollbackToLastPublished = async () => {
    try {
      setIsLoading(true)
      await appCodeStore.rollbackToLastPublished()
      message.success("已回滚到最近发布的版本")
      refreshPreview()
      setShowRollbackModal(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : "回滚失败")
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
      content: accumulatedTextRef.current || "......",
    })
  }, [updateLastMessage])

  const handleClearMessages = () => {
    setMessages([])
    accumulatedTextRef.current = ""
    currentMessageIdRef.current = null
  }

  const handleFix = (errorInfo) => {
    const missingModules = errorInfo.missingModules.join(", ")
    const dependentModules = errorInfo.dependentModules.join(", ")

    const fixCommand = `请帮我创建以下缺失的模块: ${missingModules}。这些模块被以下组件依赖: ${dependentModules}。请确保生成的模块符合项目规范并包含必要的功能。`

    addMessage({
      role: "user",
      content: fixCommand,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    })

    setModuleError(null)

    processCommand(fixCommand)
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
      if (result.success) {
        if (!result.isPMMode) {
          message.success("代码生成成功")
          refreshPreview()
        }
      } else if (result.version) {
        setModuleError(result)
        message.warning("代码已生成,但存在一些问题需要修复")
        refreshPreview()
      }

      return result
    } catch (error) {
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
    const version = appCodeStore.currentVersion
    if (!version?.modules?.[`${appId}_app_entry`]) {
      return (
        <div className='flex flex-col items-center justify-center min-h-[400px] bg-default-50'>
          <Icon icon='mdi:apps' className='w-16 h-16 text-default-300' />
          <p className='mt-4 text-default-500'>请先生成应用代码</p>
        </div>
      )
    }

    return (
      <div className='relative h-full flex flex-col'>
        <div className='sticky top-0 left-0 right-0 z-10 bg-default-100 border-b border-default-200 rounded-t-lg px-4 py-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex gap-1.5'>
                <div className='w-3 h-3 rounded-full bg-danger'></div>
                <div className='w-3 h-3 rounded-full bg-warning'></div>
                <div className='w-3 h-3 rounded-full bg-success'></div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='light'
                isIconOnly
                onClick={() => {
                  window.open(`/app-preview/${appId}`, "_blank")
                }}
                isDisabled={isRefreshing}
                className='bg-white/70 backdrop-blur-sm'
              >
                <Icon icon='fluent:open-12-regular' className={`w-4 h-4`} />
              </Button>
              <Button
                size='sm'
                variant='light'
                isIconOnly
                onClick={refreshPreview}
                isDisabled={isRefreshing}
                className='bg-white/70 backdrop-blur-sm'
              >
                <Icon icon='mdi:refresh' className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button
                size='sm'
                variant='light'
                isIconOnly
                onClick={() => {
                  const iframe = document.querySelector("iframe")
                  if (iframe && iframe.requestFullscreen) {
                    iframe.requestFullscreen()
                  } else if (iframe && iframe.webkitRequestFullscreen) {
                    iframe.webkitRequestFullscreen()
                  } else if (iframe && iframe.msRequestFullscreen) {
                    iframe.msRequestFullscreen()
                  } else {
                    console.warn("您的浏览器不支持全屏功能")
                  }
                }}
                className='bg-white/70 backdrop-blur-sm'
              >
                <Icon icon='mdi:fullscreen' className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-hidden rounded-b-lg border border-default-200 shadow-lg'>
          <iframe
            ref={iframeRef}
            src={`/app-preview/${appId}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title='App Preview'
            allowFullScreen
          />
        </div>
      </div>
    )
  }, [appId, isRefreshing, refreshPreview])

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
    <div className='flex items-center gap-2'>
      <ButtonGroup>
        <Tooltip content='保存当前版本'>
          <Button
            color='primary'
            variant='flat'
            onPress={() => setShowSaveVersionModal(true)}
            isDisabled={isLoading || publishInProgress || isCompiling}
            startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
          >
            保存版本
          </Button>
        </Tooltip>

        <Tooltip content='查看版本列表'>
          <Button
            color='primary'
            variant='flat'
            onPress={() => setShowVersionListModal(true)}
            isDisabled={isLoading || publishInProgress || isCompiling}
            startContent={<Icon icon='mdi:history' className='w-4 h-4' />}
          >
            版本列表
          </Button>
        </Tooltip>

        <Tooltip content='发布为模板供他人使用'>
          <Button
            color='secondary'
            variant='flat'
            onPress={handlePublishTemplate}
            isDisabled={isLoading || publishInProgress || isCompiling}
            isLoading={publishInProgress}
            startContent={<Icon icon='fluent:book-template-20-filled' className='w-4 h-4' />}
            aria-label='发布模板'
          >
            发布模板
          </Button>
        </Tooltip>

        <Tooltip content='发布应用到生产环境'>
          <Button
            color='danger'
            variant='flat'
            onPress={handlePublish}
            isDisabled={isLoading || publishInProgress || isCompiling}
            isLoading={publishInProgress}
            startContent={<Icon icon='mdi:rocket-launch' className='w-4 h-4' />}
          >
            发布应用
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Tooltip content='回滚到最近一次发布的版本'>
        <Button
          color='warning'
          variant='flat'
          onClick={() => setShowRollbackModal(true)}
          isDisabled={isLoading || !appCodeStore.hasPublishedVersion}
          startContent={<Icon icon='mdi:restore' className='w-4 h-4' />}
        >
          回滚到最近发布
        </Button>
      </Tooltip>
    </div>
  )

  return (
    <>
      {moduleError && <ErrorPrompt error={moduleError} onFix={handleFix} />}
      <PageLayout title={`构建应用 - ${appTitle}`} titleIcon='mdi:tools' actions={pageActions}>
        <div className='h-[calc(100vh-140px)]'>
          <AIEditor
            parseConfig={async (code: string) => ({ code })}
            messages={messages}
            setMessages={setMessages}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            agent={{
              processCommand,
            }}
            renderPreview={renderPreview}
            handleClearMessages={handleClearMessages}
            onStop={handleStop}
            showCodeTab
            appId={appId}
            onVersionChange={refreshPreview}
          />
        </div>

        <PublishModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} appId={appId} />
        <PublishTemplateModal isOpen={showPublishTemplateModal} onClose={() => setShowPublishTemplateModal(false)} />
        <RollbackModal
          isOpen={showRollbackModal}
          onClose={() => setShowRollbackModal(false)}
          onConfirm={handleRollbackToLastPublished}
        />

        {/* 新增: 版本管理相关模态框 */}
        <SaveVersionModal
          isOpen={showSaveVersionModal}
          onClose={() => setShowSaveVersionModal(false)}
          onSave={handleSaveVersion}
        />
        <VersionListModal
          isOpen={showVersionListModal}
          onClose={() => setShowVersionListModal(false)}
          versions={versions}
          onPublish={handlePublishFromVersion}
          onDelete={handleDeleteVersion}
          onPull={handlePullVersion} // 新增的处理函数
        />
      </PageLayout>
    </>
  )
})

export default AppBuilder
