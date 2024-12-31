import React, { useState, useEffect, useCallback } from "react"
import { ResizableHandle, ResizablePanelGroup } from "@/components/ui/resizable"
import message from "@/components/Message"
import MessageCard from "@/components/MessageCard"
import AICommandInput from "./components/AICommandInput"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { Tabs, Tab, Button, ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResizablePanel } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { AI_LEVELS, AIEditorProps } from "./type"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../store/appCodeStore"
import { CodeView } from "./components/CodeView"

const AIEditor: React.FC<AIEditorProps> = observer(
  ({
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
    appId,
  }) => {
    // 在应用开发场景中，始终使用专家模型
    const selectedAILevel: keyof typeof AI_LEVELS = "EXPERT"

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
                    onClick={() => appCodeStore.rollback()}
                    disabled={!appCodeStore.canRollback}
                    className={cn(
                      "h-8 w-8 p-0 rounded-full transition-all duration-200",
                      "hover:bg-primary/10 active:scale-95",
                      !appCodeStore.canRollback && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon icon='mdi:chevron-left' className='h-4 w-4' />
                  </Button>

                  <div className='version-info px-2 min-w-[80px] text-center'>
                    <span className='text-sm font-medium'>
                      {appCodeStore.currentIndex + 1}/{appCodeStore.versions.length}
                    </span>
                  </div>

                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => appCodeStore.forward()}
                    disabled={!appCodeStore.canForward}
                    className={cn(
                      "h-8 w-8 p-0 rounded-full transition-all duration-200",
                      "hover:bg-primary/10 active:scale-95",
                      !appCodeStore.canForward && "opacity-50 cursor-not-allowed"
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

            <CodeView 
              appId={appId}
              showCodeTab={showCodeTab}
              selectedTab={selectedTab}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }
)

AIEditor.displayName = "AIEditor"

export default AIEditor