import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import PageLayout from "@/app/admin/src/component/PageLayout"
import AIEditor from "./AIEditor/AppAIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage, CodeItem } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { appCodeStore } from "./store/appCodeStore"

// 改进的错误提示组件
const ErrorPrompt = ({ error, onFix }) => {
  // 解析错误信息
  const parseError = (error) => {
    if (error.moduleErrors) {
      return {
        missingModules: error.moduleErrors.missingModules,
        dependentModules: error.moduleErrors.dependentModules,
      }
    }
    return null
  }

  const errorInfo = parseError(error)
  if (!errorInfo) return null

  return (
    <div className='p-4 bg-danger-50 rounded-lg mb-4'>
      <div className='flex items-start gap-3'>
        <Icon icon='mdi:alert-circle' className='w-5 h-5 text-danger mt-0.5' />
        <div className='flex-1'>
          <h4 className='font-medium text-danger'>检测到缺失模块</h4>
          <div className='mt-2 space-y-1 text-sm text-danger-600'>
            <p>缺失模块:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.missingModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
            <p>依赖这些模块的组件:</p>
            <ul className='list-disc pl-4'>
              {errorInfo.dependentModules.map((module, index) => (
                <li key={index}>
                  <code>{module}</code>
                </li>
              ))}
            </ul>
          </div>
          <Button
            color='primary'
            variant='flat'
            size='sm'
            className='mt-3'
            startContent={<Icon icon='mdi:wrench' className='w-4 h-4' />}
            onClick={() => onFix(errorInfo)}
          >
            修复此问题
          </Button>
        </div>
      </div>
    </div>
  )
}

const MAX_MESSAGES = 4

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
  const [publishInProgress, setPublishInProgress] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState(null)

  const accumulatedTextRef = useRef("")
  const currentMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "应用管理", href: "/admin/apps" },
      { label: "应用开发", href: "" },
    ])
  }, [])

  // 添加消息监听
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "AI_FIX_REQUEST") {
        const errorInfo = event.data.payload

        const fixPrompt = `请帮我修复以下错误:
          错误信息: ${errorInfo.error}
          路由路径: ${errorInfo.context?.route}
          堆栈信息: ${errorInfo.stack}
          ${errorInfo.context?.type === "module_error" ? "这是一个模块执行错误。" : ""}
          
          请分析错误原因并生成修复后的完整代码, 每个模块的代码都必须完整, 不能省略任何部分。`

        processCommand(fixPrompt) // 直接调用即可,processCommand内部会处理消息添加
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

        // loadApp 内部会处理所有初始化逻辑
        const version = await appCodeStore.loadApp(appId)

        // 只需要处理UI相关的初始化
        if (version?.app?.name) {
          setAppTitle(version.app.name)
        }

        // 设置默认标签页
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

  const refreshPreview = useCallback(() => {
    if (iframeRef.current && !isRefreshing) {
      setIsRefreshing(true)
      iframeRef.current.src = iframeRef.current.src
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }, [isRefreshing])

  const handlePublish = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      setPublishInProgress(true)
      setPublishError(null)

      // 使用appCodeStore发布
      const result = await appCodeStore.publishToServer({
        useLatest: !appCodeStore.isViewingHistory,
      })

      if (result.publishInfo.hasNewerVersion) {
        message.info(`已发布${result.publishInfo.versionDate}的版本，` + "但存在更新的版本未发布")
      } else {
        message.success("发布成功")
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

  // 改进的错误修复处理函数
  const handleFix = (errorInfo) => {
    const missingModules = errorInfo.missingModules.join(", ")
    const dependentModules = errorInfo.dependentModules.join(", ")

    // 构造修复指令
    const fixCommand = `请帮我创建以下缺失的模块: ${missingModules}。这些模块被以下组件依赖: ${dependentModules}。请确保生成的模块符合项目规范并包含必要的功能。`

    // 添加用户消息
    const userMessage = {
      role: "user",
      content: fixCommand,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    }

    // 将消息添加到对话
    addMessage(userMessage)

    // 清除错误状态
    setModuleError(null)

    // 触发AI处理
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

      // 处理结果
      if (result.success) {
        message.success("代码生成成功")
        refreshPreview()
      } else if (result.version) {
        // 如果有版本但有错误,设置错误状态但仍然使用生成的代码
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

  const handleCommandResult = useCallback(
    async (result: any) => {
      try {
        if (result.success) {
          message.success("代码生成成功")
        } else if (result.version) {
          message.warning("代码已生成,但存在一些问题需要修复")
        }
        refreshPreview()
      } catch (error) {
        console.error("Error handling command result:", error)
        message.error("处理结果失败")
      }
    },
    [refreshPreview]
  )

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
        {/* 浏览器风格的工具栏 */}
        <div className='sticky top-0 left-0 right-0 z-10 bg-default-100 border-b border-default-200 rounded-t-lg px-4 py-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {/* 浏览器装饰点 */}
              <div className='flex gap-1.5'>
                <div className='w-3 h-3 rounded-full bg-danger'></div>
                <div className='w-3 h-3 rounded-full bg-warning'></div>
                <div className='w-3 h-3 rounded-full bg-success'></div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {/* 刷新按钮 */}
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
              {/* 全屏按钮 */}
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

        {/* iframe 容器 */}
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
    <Button
      color='primary'
      onClick={handlePublish}
      isDisabled={isLoading || publishInProgress}
      isLoading={publishInProgress}
      startContent={<Icon icon='mdi:rocket-launch' className='w-4 h-4' />}
    >
      发布应用
    </Button>
  )

  return (
    <>
      {moduleError && <ErrorPrompt error={moduleError} onFix={handleFix} />}
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
            appId={appId}
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
    </>
  )
})

export default AppBuilder
