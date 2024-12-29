import React, { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable"
import message from "@/components/Message"
import Editor from "@monaco-editor/react"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "./components/AICommandInput"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { Tabs, Tab, Button, Select, SelectItem, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizablePanel } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { versionStore } from "../store/versionStore"
import { AI_LEVELS, AIEditorProps } from "./type"

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

const AIEditor: React.FC<AIEditorProps> = ({
  onStop,
  messages,
  selectedTab,
  onTabChange,
  onCommandResult,
  handleClearMessages,
  agent,
  renderPreview,
  renderDataView,
  showDataTab = false,
  showCodeTab = false,
  previewTabName = "预览",
  codeItems = [],
  selectedCodeId,
  onCodeSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState("")
  const [content, setContent] = useState(versionStore.getCurrentContent())
  const [currentVersion, setCurrentVersion] = useState(versionStore.getCurrentVersion())

  // 在应用开发场景中，始终使用专家模型
  const selectedAILevel: keyof typeof AI_LEVELS = "EXPERT"

  // 监听版本变化
  useEffect(() => {
    const contentUnsubscribe = versionStore.subscribeToContent((newContent) => {
      setContent(newContent)
      updateCodeItems()
    })

    const historyUnsubscribe = versionStore.subscribeToHistory(() => {
      setCurrentVersion(versionStore.getCurrentVersion())
      updateCodeItems()
    })

    return () => {
      contentUnsubscribe()
      historyUnsubscribe()
    }
  }, [])

  // 更新代码列表
  const updateCodeItems = () => {
    const version = versionStore.getCurrentVersion()
    if (!version) return

    const items: typeof codeItems = []

    // 添加应用入口代码
    if (version.content) {
      items.push({
        id: "app_entry",
        title: "应用入口 (App Entry)",
        type: "app",
        code: version.content,
        updatedAt: version.appState?.updatedAt,
      })
    }

    // 添加页面代码
    if (version.appState?.pages) {
      Object.entries(version.appState.pages).forEach(([pageId, page]) => {
        items.push({
          id: pageId,
          title: `${page.title} (${pageId})`,
          type: "page",
          code: page.code,
          updatedAt: page.updatedAt,
        })
      })
    }

    // 如果没有选中的代码，选择第一项
    if (items.length > 0 && !selectedCodeId) {
      onCodeSelect?.(items[0].id)
    }
  }

  // 初始化时更新代码列表
  useEffect(() => {
    updateCodeItems()
  }, [])

  useEffect(() => {
    if (selectedCodeId) {
      const version = versionStore.getCurrentVersion()
      if (!version) return

      if (selectedCodeId === "app_entry") {
        setEditedCode(version.content || "")
      } else {
        const pageCode = version.appState?.pages[selectedCodeId]?.code
        if (pageCode) {
          setEditedCode(pageCode)
        }
      }
    }
  }, [selectedCodeId, currentVersion])

  const handleSaveEdit = async () => {
    try {
      const selectedItem = codeItems.find((item) => item.id === selectedCodeId)
      if (!selectedItem) return

      const currentVersion = versionStore.getCurrentVersion()
      if (!currentVersion) return

      if (selectedItem.type === "app") {
        const wrappedCode = wrapWithShataAIForm(editedCode)
        onCommandResult({
          success: true,
          rawConfig: wrappedCode,
          appCode: extractShataAIFormContent(wrappedCode),
        })
      } else {
        const updatedPages = { ...currentVersion.appState?.pages }
        updatedPages[selectedItem.id] = {
          ...updatedPages[selectedItem.id],
          code: editedCode,
          title: selectedItem.title,
          updatedAt: new Date().toISOString(),
        }

        // 添加新版本
        versionStore.addVersion(currentVersion.content, {
          pages: updatedPages,
          version: (currentVersion.appState?.version || 0) + 1,
          updatedAt: new Date().toISOString(),
        })

        onCommandResult({
          success: true,
          pages: {
            [selectedItem.id]: {
              code: editedCode,
              title: selectedItem.title,
              updatedAt: new Date().toISOString(),
            },
          },
        })
      }

      setIsEditing(false)
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving edit:", error)
      message.error("配置格式有误，请检查")
    }
  }

  const handleCancelEdit = () => {
    const version = versionStore.getCurrentVersion()
    if (!version || !selectedCodeId) return

    if (selectedCodeId === "app_entry") {
      setEditedCode(version.content || "")
    } else {
      const pageCode = version.appState?.pages[selectedCodeId]?.code
      if (pageCode) {
        setEditedCode(pageCode)
      }
    }
    setIsEditing(false)
  }

  const renderCodeEditor = (content: string, isEditing: boolean) => {
    return (
      <div className='h-full w-full'>
        <Editor
          height='100%'
          width='100%'
          language='javascript'
          value={content}
          options={{
            readOnly: !isEditing,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
          }}
          theme='vs-dark'
          onChange={(value) => {
            if (isEditing) {
              setEditedCode(value || "")
            }
          }}
        />
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction='horizontal'>
      <ResizablePanel defaultSize={50} className='resizable-panel'>
        <div className='h-full flex flex-col'>
          <div className='flex justify-between items-center p-2 border-b mb-2'>
            <div className='flex items-center gap-4'></div>
            <Button
              size='sm'
              variant='light'
              color='primary'
              onClick={handleClearMessages}
              startContent={<Icon icon='mdi:refresh' className='w-4 h-4' />}
            >
              新对话
            </Button>
          </div>
          <ScrollShadow className='flex-1 overflow-y-auto pb-9'>
            <div className='space-y-4'>
              {messages.map((message) => (
                <div key={message.id}>
                  <MessageCard
                    avatar={message.role === "assistant" ? mo2 : user}
                    message={message.content}
                    role={message.role}
                    status={message.status || "success"}
                    className='message-card max-w-[90%]'
                    aiLevel={message.aiLevel}
                  />
                </div>
              ))}
            </div>
          </ScrollShadow>

          <div className='p-2'>
            <AICommandInput onStop={onStop} agent={agent} onResult={onCommandResult} aiLevel={selectedAILevel} />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50} className='resizable-panel bg-slate-50'>
        <div className='relative h-full flex flex-col'>
          <div className='version-control-wrapper absolute -top-2 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 transition-all duration-200 hover:bg-white z-50'>
            <div className='flex items-center gap-3'>
              <div className='version-controls flex items-center gap-1'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={versionStore.rollback.bind(versionStore)}
                  disabled={!versionStore.canRollback()}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full transition-all duration-200",
                    "hover:bg-primary/10 active:scale-95",
                    !versionStore.canRollback() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon icon='mdi:chevron-left' className='h-4 w-4' />
                </Button>

                <div className='version-info px-2 min-w-[80px] text-center'>
                  <span className='text-sm font-medium'>
                    {versionStore.getCurrentVersion()
                      ? versionStore.getHistory().findIndex((v) => v === versionStore.getCurrentVersion()) + 1
                      : 0}
                    /{versionStore.getHistory().length}
                  </span>
                </div>

                <Button
                  size='sm'
                  variant='ghost'
                  onClick={versionStore.forward.bind(versionStore)}
                  disabled={!versionStore.canForward()}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full transition-all duration-200",
                    "hover:bg-primary/10 active:scale-95",
                    !versionStore.canForward() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon icon='mdi:chevron-right' className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
          <Tabs size='sm' selectedKey={selectedTab} onSelectionChange={(key) => onTabChange(key.toString())}>
            {showDataTab && <Tab key='data' title='数据源' />}
            <Tab key='preview' title={previewTabName}>
              <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderPreview()}</div>
            </Tab>
            {showCodeTab && <Tab key='code' title='代码视图' />}
          </Tabs>

          {selectedTab === "data" && showDataTab && (
            <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderDataView?.()}</div>
          )}
          {selectedTab === "code" && showCodeTab && (
            <div className='relative h-[calc(100vh-260px)] rounded-lg overflow-hidden mt-2'>
              <div className='absolute top-2 left-2 right-2 z-10 flex justify-between items-center'>
                <Select
                  size='sm'
                  className='max-w-xs bg-white/80 backdrop-blur-sm'
                  selectedKeys={selectedCodeId ? [selectedCodeId] : []}
                  onChange={(e) => onCodeSelect?.(e.target.value)}
                >
                  {codeItems?.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      startContent={
                        <Icon icon={item.type === "app" ? "mdi:application" : "mdi:file-code"} className='w-4 h-4' />
                      }
                    >
                      {item.title}
                    </SelectItem>
                  ))}
                </Select>

                {isEditing ? (
                  <div className='space-x-2'>
                    <Button
                      size='sm'
                      color='primary'
                      onClick={handleSaveEdit}
                      startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
                    >
                      保存
                    </Button>
                    <Button
                      size='sm'
                      variant='flat'
                      onClick={handleCancelEdit}
                      startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    size='sm'
                    color='primary'
                    onClick={() => setIsEditing?.(true)}
                    startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                  >
                    编辑
                  </Button>
                )}
              </div>
              <div className='h-full pt-14 pb-2 px-2'>
                {renderCodeEditor(
                  isEditing
                    ? editedCode
                    : selectedCodeId === "app_entry"
                    ? content
                    : currentVersion?.appState?.pages[selectedCodeId]?.code || "",
                  isEditing
                )}
              </div>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default AIEditor