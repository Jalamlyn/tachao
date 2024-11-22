import React, { useState, useCallback, useEffect, useRef } from "react"
import { ScrollShadow, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "@/components/AICommandInput"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import message from "@/components/Message"

import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import AIFormAgent from "@/service/agents/AIFormAgent"

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

interface AIEditorProps {
  messages: Message[]
  selectedTab: string
  onTabChange: (key: string) => void
  onCommandResult: (result: any) => void
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
  }
  renderPreview: (version: any) => React.ReactNode
  renderCodeView?: (version: any) => React.ReactNode
  renderDataView?: () => React.ReactNode
  showDataTab?: boolean
  showCodeTab?: boolean
  previewTabName?: string
}

// 图片上传组件
const ImageUploader: React.FC<{ agent: AIEditorProps["agent"] }> = ({ agent }) => {
  const [preview, setPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      message.error("图片大小不能超过5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      message.error("只支持 JPG, PNG, GIF 格式")
      return
    }

    setIsLoading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreview(base64)
        agent.cacheImage?.(base64)
        setIsLoading(false)
      }
      reader.onerror = () => {
        message.error("图片读取失败")
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      message.error("图片上传失败")
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPreview("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    agent.clearCachedImage?.()
  }

  return (
    <div className='flex items-center gap-2 mb-2'>
      <input
        type='file'
        ref={inputRef}
        className='hidden'
        accept='image/jpeg,image/png,image/gif'
        onChange={handleUpload}
      />
      <Button
        variant='outline'
        size='sm'
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className='flex items-center gap-2'
      >
        <Icon icon='mdi:image-plus' className='w-4 h-4' />
        {isLoading ? "上传中..." : "上传图片"}
      </Button>
      {preview && (
        <div className='relative'>
          <img src={preview} alt='Preview' className='w-16 h-16 object-cover rounded border border-default-200' />
          <Button
            size='sm'
            variant='ghost'
            className='absolute -top-2 -right-2 p-0 min-w-unit-6 w-unit-6 h-unit-6 rounded-full'
            onClick={handleClear}
          >
            <Icon icon='mdi:close' className='w-3 h-3' />
          </Button>
        </div>
      )}
    </div>
  )
}

const AIEditor: React.FC<AIEditorProps> = ({
  imageUpload = true,
  messages,
  selectedTab,
  onTabChange,
  onCommandResult,
  agent,
  versionControl,
  renderPreview,
  renderCodeView,
  renderDataView,
  showDataTab = false,
  showCodeTab = false,
  previewTabName = "预览",
}) => {
  // 添加版本变化的监听
  const [currentVersion, setCurrentVersion] = useState(versionControl.getCurrentVersion())

  useEffect(() => {
    setCurrentVersion(versionControl.getCurrentVersion())
  }, [versionControl.currentIndex])

  return (
    <div className='h-[calc(100vh-140px)] overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-full p-2'>
        <ResizablePanel defaultSize={30} className='resizable-panel'>
          <div className='h-full flex flex-col'>
            <ScrollShadow className='flex-1 overflow-y-auto'>
              <div className='space-y-4'>
                {messages.map((message) => (
                  <div key={message.id}>
                    <MessageCard
                      avatar={message.role === "assistant" ? mo2 : user}
                      message={message.content}
                      role={message.role}
                      status={message.status || "success"}
                      className='message-card'
                    />
                  </div>
                ))}
              </div>
            </ScrollShadow>

            <div className='p-2'>
              {imageUpload && <ImageUploader agent={AIFormAgent} />}
              <AICommandInput agent={agent} onResult={onCommandResult} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} className='resizable-panel bg-slate-50'>
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
              <div className='h-[calc(100vh-260px)] rounded-lg overflow-auto p-2 bg-slate-900 text-white text-wrap mt-2'>
                {renderCodeView?.(currentVersion)}
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default AIEditor
