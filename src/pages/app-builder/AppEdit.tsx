import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import PageLayout from "@/components/PageLayout"
import AIEditor from "./AIEditor"
import AppAgent from "./AppAgent"
import { AppBuilderMessage, CodeItem, PublishData } from "./types"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { versionStore } from "./store/versionStore"
import { toJS } from "mobx"

const MAX_MESSAGES = 10
const CODE_TYPES = ["app", "page", "store", "service", "module", "schema"] as const

export const extractShataAIFormContent = (content: string): string => {
  if (!content) {
    return ""
  }
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content?.match(regex)
  return match ? match[1].trim() : content
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
  const [publishInProgress, setPublishInProgress] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

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
      updateCodeItems()
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

    // App Entry
    if (currentVersion.content) {
      items.push({
        id: "app_entry",
        title: "应用入口 (App Entry)",
        type: "app",
        code: currentVersion.content,
        updatedAt: currentVersion.appState?.updatedAt,
      })
    }

    // Pages
    if (currentVersion.appState?.pages) {
      Object.entries(currentVersion.appState.pages).forEach(([pageId, page]) => {
        items.push({
          id: pageId,
          title: `${page.title}`,
          type: "page",
          code: page.code,
          updatedAt: page.updatedAt,
        })
      })
    }

    // Stores
    if (currentVersion.appState?.stores) {
      Object.entries(currentVersion.appState.stores).forEach(([name, store]) => {
        items.push({
          id: `store_${name}`,
          title: `Store: ${name}`,
          type: "store",
          name,
          code: store.code,
          updatedAt: store.updatedAt,
        })
      })
    }

    // Services
    if (currentVersion.appState?.services) {
      Object.entries(currentVersion.appState.services).forEach(([name, service]) => {
        items.push({
          id: `service_${name}`,
          title: `Service: ${name}`,
          type: "service",
          name,
          code: service.code,
          updatedAt: service.updatedAt,
        })
      })
    }

    // Modules
    if (currentVersion.appState?.modules) {
      Object.entries(currentVersion.appState.modules).forEach(([name, module]) => {
        items.push({
          id: `module_${name}`,
          title: `Module: ${name}`,
          type: "module",
          name,
          code: module.code,
          updatedAt: module.updatedAt,
        })
      })
    }

    // Schemas
    if (currentVersion.appState?.schemas) {
      Object.entries(currentVersion.appState.schemas).forEach(([name, schema]) => {
        items.push({
          id: `schema_${name}`,
          title: `Schema: ${name}`,
          type: "schema",
          name,
          code: schema.code,
          updatedAt: schema.updatedAt,
        })
      })
    }

    // 按类型和更新时间排序
    items.sort((a, b) => {
      // 首先按类型排序
      const typeOrder = CODE_TYPES.indexOf(a.type) - CODE_TYPES.indexOf(b.type)
      if (typeOrder !== 0) return typeOrder

      // 然后按更新时间倒序
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return timeB - timeA
    })

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

          // 使用 toJS 转换 MobX 响应式对象为普通对象
          const plainAppState = currentVersion.appState ? toJS(currentVersion.appState) : {}

          try {
            targetWindow.postMessage(
              {
                type: "update_preview",
                appId,
                code: currentVersion.content,
                stores: plainAppState.stores || {},
                services: plainAppState.services || {},
                modules: plainAppState.modules || {},
                schemas: plainAppState.schemas || {},
              },
              "*"
            )
          } catch (error) {
            console.error("Error posting message to preview:", error)
            message.error("预览更新失败")
          }
        }
      } else if (event.data.type === "request_page_code" && event.data.appId === appId) {
        const { pageId } = event.data
        const pageCode = versionStore.getPageCode(pageId)

        const iframe = document.querySelector("iframe")
        if (iframe?.contentWindow) {
          try {
            iframe.contentWindow.postMessage(
              {
                type: "update_page_code",
                appId,
                pageId,
                code: pageCode ? toJS(pageCode) : null, // 这里也使用 toJS
              },
              "*"
            )
          } catch (error) {
            console.error("Error posting page code:", error)
            message.error("页面代码更新失败")
          }
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

  const handlePublish = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      setPublishInProgress(true)
      setPublishError(null)

      const publishData = versionStore.exportForPublish()
      if (!publishData) {
        throw new Error("没有可发布的内容")
      }

      // 验证所有必需的代码
      validatePublishData(publishData)

      // 发布页面代码
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

      // 发布其他类型的代码
      const codeTypes = [
        { type: "stores", data: publishData.stores },
        { type: "services", data: publishData.services },
        { type: "modules", data: publishData.modules },
        { type: "schemas", data: publishData.schemas },
      ]

      for (const { type, data } of codeTypes) {
        if (Object.keys(data || {}).length > 0) {
          await setMetadata(`${appId}_${type}`, JSON.stringify(data))
        }
      }

      // 发布应用入口代码
      await setMetadata(
        `app_${appId}`,
        JSON.stringify({
          code: publishData.appCode,
          updatedAt: publishData.updatedAt,
          version: publishData.version,
        })
      )

      // 更新应用索引
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
      setPublishError(error instanceof Error ? error.message : "发布失败")
      message.error(error instanceof Error ? error.message : "发布失败")
    } finally {
      setIsLoading(false)
      setPublishInProgress(false)
    }
  }

  const validatePublishData = (data: PublishData) => {
    if (!data.appCode) {
      throw new Error("缺少应用入口代码")
    }

    if (Object.keys(data.pages).length === 0) {
      throw new Error("至少需要一个页面")
    }

    // 验证每个页面的必需字段
    Object.entries(data.pages).forEach(([pageId, page]) => {
      if (!page.code || !page.title) {
        throw new Error(`页面 ${pageId} 缺少必需的字段`)
      }
    })

    // 验证其他类型代码的完整性
    const validateCode = (type: string, items: Record<string, any>) => {
      Object.entries(items || {}).forEach(([name, item]) => {
        if (!item.code) {
          throw new Error(`${type} ${name} 缺少代码内容`)
        }
      })
    }

    validateCode("Store", data.stores)
    validateCode("Service", data.services)
    validateCode("Module", data.modules)
    validateCode("Schema", data.schemas)
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

  const handleCommandResult = useCallback(
    (result: {
      success: boolean
      appCode?: string
      pages?: { [pageId: string]: any }
      stores?: { [name: string]: any }
      services?: { [name: string]: any }
      modules?: { [name: string]: any }
      schemas?: { [name: string]: any }
      error?: string
    }) => {
      if (!result.success) {
        message.error(result.error || "处理失败")
        return
      }

      try {
        const currentVersion = versionStore.currentVersion
        
        // 初始化新的应用状态
        const newAppState = {
          pages: {},
          stores: {},
          services: {},
          modules: {},
          schemas: {},
          version: 1,
          updatedAt: new Date().toISOString(),
        }

        // 如果存在当前版本，则合并现有状态
        if (currentVersion?.appState) {
          newAppState.pages = { ...currentVersion.appState.pages }
          newAppState.stores = { ...currentVersion.appState.stores }
          newAppState.services = { ...currentVersion.appState.services }
          newAppState.modules = { ...currentVersion.appState.modules }
          newAppState.schemas = { ...currentVersion.appState.schemas }
          newAppState.version = (currentVersion.appState.version || 0) + 1
        }

        // 合并新生成的代码
        if (result.pages) {
          Object.entries(result.pages).forEach(([pageId, page]) => {
            newAppState.pages[pageId] = {
              code: page.code,
              title: page.title,
              updatedAt: page.updatedAt || new Date().toISOString(),
            }
          })
        }

        if (result.stores) {
          Object.entries(result.stores).forEach(([name, store]) => {
            newAppState.stores[name] = {
              code: store.code,
              updatedAt: store.updatedAt || new Date().toISOString(),
            }
          })
        }

        if (result.services) {
          Object.entries(result.services).forEach(([name, service]) => {
            newAppState.services[name] = {
              code: service.code,
              updatedAt: service.updatedAt || new Date().toISOString(),
            }
          })
        }

        if (result.modules) {
          Object.entries(result.modules).forEach(([name, module]) => {
            newAppState.modules[name] = {
              code: module.code,
              updatedAt: module.updatedAt || new Date().toISOString(),
            }
          })
        }

        if (result.schemas) {
          Object.entries(result.schemas).forEach(([name, schema]) => {
            newAppState.schemas[name] = {
              code: schema.code,
              updatedAt: schema.updatedAt || new Date().toISOString(),
            }
          })
        }

        // 更新版本
        if (result.appCode) {
          versionStore.addVersion(result.appCode, newAppState)
        } else if (
          result.pages ||
          result.stores ||
          result.services ||
          result.modules ||
          result.schemas
        ) {
          versionStore.addVersion(currentVersion?.content || "", newAppState)
        }

        // 更新代码项列表
        updateCodeItems()

        message.success("代码生成成功")
      } catch (error) {
        console.error("Error handling command result:", error)
        message.error("处理结果失败")
      }
    },
    [updateCodeItems]
  )

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
      <div className='relative'>
        {/* 浏览器风格的工具栏 */}
        <div className='absolute top-0 left-0 right-0 z-10 bg-default-100 border-b border-default-200 rounded-t-lg px-4 py-2'>
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
        <div className='rounded-lg overflow-hidden border border-default-200 shadow-lg pt-12'>
          <iframe
            ref={iframeRef}
            src={`/app-preview/${appId}`}
            style={{
              width: "100%",
              height: "600px",
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