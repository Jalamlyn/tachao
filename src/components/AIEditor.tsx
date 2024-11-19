import React, { useState, useCallback, useEffect } from "react"
import { ScrollShadow, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "@/components/AICommandInput"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

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

const AIEditor: React.FC<AIEditorProps> = ({
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

            <AICommandInput agent={agent} onResult={onCommandResult} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} className='resizable-panel bg-slate-50'>
          <div className='h-full flex flex-col'>
            <Tabs size='sm' selectedKey={selectedTab} onSelectionChange={(key) => onTabChange(key.toString())}>
              {showDataTab && <Tab key='data' title='数据表格' />}
              <Tab key='preview' title={previewTabName}>
                <div className='relative h-[calc(100vh-260px)] overflow-auto p-2'>
                  {/* Version Control UI */}
                  <div className='absolute top-4 right-4 flex items-center gap-2 z-10'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={versionControl.rollback}
                      disabled={!versionControl.canRollback}
                      className={cn(
                        "h-8 w-8 p-0",
                        !versionControl.canRollback && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Icon icon='mdi:chevron-left' className='h-4 w-4' />
                    </Button>
                    <span className='text-sm text-gray-500'>
                      版本 {versionControl.currentIndex + 1}/{versionControl.versions.length}
                    </span>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={versionControl.forward}
                      disabled={!versionControl.canForward}
                      className={cn("h-8 w-8 p-0", !versionControl.canForward && "opacity-50 cursor-not-allowed")}
                    >
                      <Icon icon='mdi:chevron-right' className='h-4 w-4' />
                    </Button>
                  </div>
                  {renderPreview(currentVersion)}
                </div>
              </Tab>
              {showCodeTab && <Tab key='code' title='代码视图' />}
            </Tabs>

            {selectedTab === "data" && showDataTab && (
              <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderDataView?.()}</div>
            )}
            {selectedTab === "code" && showCodeTab && (
              <div className='h-[calc(100vh-260px)] rounded-lg overflow-auto p-2 bg-slate-900 text-white text-wrap'>
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