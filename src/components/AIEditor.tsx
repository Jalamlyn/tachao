import React, { useState, useEffect } from "react"
import { ScrollShadow, Tabs, Tab, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "@/components/AICommandInput"
import { cn } from "@/lib/utils"
import message from "@/components/Message"
import Editor from "@monaco-editor/react"

import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { ImageUploader } from "./ImageUpload"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
  code?: {
    preview?: React.ReactNode
    content?: string
  }
}

export interface AIEditorProps {
  parseConfig: any
  messages: Message[]
  selectedTab: string
  onTabChange: (key: string) => void
  onCommandResult: (result: any) => void
  onClearMessages?: () => void
  agent: {
    processCommand: (command: string) => Promise<any>
    cacheImage?: (imageData: string) => void
    clearCachedImage?: () => void
  }
  versionControl: {
    versions: any[]
    currentIndex: number
    rollback: () => any | null
    forward: () => any | null
    canRollback: boolean
    canForward: boolean
    getCurrentVersion: () => any | null
    addVersion: (version: any) => void
  }
  renderPreview: (version: any) => React.ReactNode
  renderDataView?: () => React.ReactNode
  showDataTab?: boolean
  showCodeTab?: boolean
  previewTabName?: string
  codeEditorOptions?: {
    language?: string
    readOnly?: boolean
    theme?: string
    customOptions?: any
  }
}

// 辅助函数：提取 <shata-ai-code> 标签中的内容
const extractShataAIFormContent = (content: string): string => {
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content.match(regex)
  return match ? match[1].trim() : content
}

// 辅助函数：用 <shata-ai-code> 标签包装内容
const wrapWithShataAIForm = (content: string): string => {
  return `<shata-ai-code>\n${content}\n</shata-ai-code>`
}

const AIEditor: React.FC<AIEditorProps> = ({
  imageUpload = true,
  parseConfig,
  messages,
  selectedTab,
  onTabChange,
  onCommandResult,
  onClearMessages,
  agent,
  versionControl,
  renderPreview,
  renderDataView,
  showDataTab = false,
  showCodeTab = false,
  previewTabName = "预览",
  codeEditorOptions = {
    language: "javascript",
    readOnly: false,
    theme: "vs-dark",
  },
}) => {
  const [currentVersion, setCurrentVersion] = useState(versionControl.getCurrentVersion())
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState("")

  useEffect(() => {
    setCurrentVersion(versionControl.getCurrentVersion())
    setIsEditing(false)
    // 处理可能包含 <shata-ai-code> 标签的内容
    const rawConfig = versionControl.getCurrentVersion()?.rawConfig || ""
    setEditedCode(extractShataAIFormContent(rawConfig))
  }, [versionControl.currentIndex])

  const handleSaveEdit = async () => {
    try {
      const parser = parseConfig || AIFormAgent.parseConfig
      // 在保存前重新添加 <shata-ai-code> 标签
      const wrappedCode = wrapWithShataAIForm(editedCode)
      const parsedConfig = await parser(wrappedCode)

      versionControl.addVersion({
        formConfig: parsedConfig.config,
        rawConfig: wrappedCode,
      })

      onCommandResult({
        success: true,
        config: parsedConfig.config,
        rawConfig: wrappedCode,
      })

      setIsEditing(false)
      message.success("保存成功")
    } catch (error) {
      console.error("Error saving edit:", error)
      message.error("配置格式有误，请检查")
    }
  }

  const handleCancelEdit = () => {
    const rawConfig = currentVersion?.rawConfig || ""
    setEditedCode(extractShataAIFormContent(rawConfig))
    setIsEditing(false)
  }

  const handleClearMessages = () => {
    if (onClearMessages) {
      onClearMessages()
      message.success("对话已清空")
    }
  }

  // 统一的代码编辑器渲染
  const renderCodeEditor = (content: string, isEditing: boolean) => (
    <Editor
      height='100%'
      language='javascript'
      value={extractShataAIFormContent(content)}
      options={{
        readOnly: !isEditing,
        minimap: { enabled: false },
        fontSize: "14",
        lineNumbers: "on",
        wordWrap: "on",
      }}
      theme='vs-dark'
      onChange={(value) => {
        if (isEditing) {
          setEditedCode(value || "")
          setIsEditing(true)
        }
      }}
    />
  )

  return (
    <div className='h-[calc(100vh-140px)] overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-full p-2'>
        <ResizablePanel defaultSize={50} className='resizable-panel'>
          <div className='h-full flex flex-col'>
            <div className='flex justify-between items-center p-2 border-b mb-2'>
              <h3 className='text-lg font-medium'>对话</h3>
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
                    />
                  </div>
                ))}
              </div>
            </ScrollShadow>

            <div className='p-2'>
              {imageUpload && <ImageUploader agent={agent} />}
              <AICommandInput agent={agent} onResult={onCommandResult} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className='resizable-panel bg-slate-50'>
          <div className='relative h-full flex flex-col'>
            <div className='version-control-wrapper absolute -top-2 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 transition-all duration-200 hover:bg-white'>
              <div className='flex items-center gap-3'>
                <div className='version-controls flex items-center gap-1'>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={versionControl.rollback}
                    disabled={!versionControl.canRollback}
                    className={cn(
                      "h-8 w-8 p-0 rounded-full transition-all duration-200",
                      "hover:bg-primary/10 active:scale-95",
                      !versionControl.canRollback && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon icon='mdi:chevron-left' className='h-4 w-4' />
                  </Button>

                  <div className='version-info px-2 min-w-[80px] text-center'>
                    <span className='text-sm font-medium'>
                      {versionControl.currentIndex + 1}/{versionControl.versions.length}
                    </span>
                  </div>

                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={versionControl.forward}
                    disabled={!versionControl.canForward}
                    className={cn(
                      "h-8 w-8 p-0 rounded-full transition-all duration-200",
                      "hover:bg-primary/10 active:scale-95",
                      !versionControl.canForward && "opacity-50 cursor-not-allowed"
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
                <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderPreview(currentVersion)}</div>
              </Tab>
              {showCodeTab && <Tab key='code' title='代码视图' />}
            </Tabs>

            {selectedTab === "data" && showDataTab && (
              <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderDataView?.()}</div>
            )}
            {selectedTab === "code" && showCodeTab && (
              <div className='relative h-[calc(100vh-260px)] rounded-lg overflow-auto mt-2'>
                <>
                  {renderCodeEditor(isEditing ? editedCode : currentVersion?.rawConfig || "", isEditing)}
                  {isEditing ? (
                    <div className='absolute top-2 right-2 space-x-2'>
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
                    <div className='absolute top-2 right-2'>
                      <Button
                        size='sm'
                        color='primary'
                        onClick={() => setIsEditing(true)}
                        startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                      >
                        编辑
                      </Button>
                    </div>
                  )}
                </>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default AIEditor
