import React, { useState, useEffect, useCallback } from "react"
import AICommandInput from "./components/AICommandInput"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import { Tabs, Tab, Button, ScrollShadow, Avatar, Spinner, Modal, ModalContent } from "@nextui-org/react"
import { Icon } from "@iconify/react"
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
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState("")
    const selectedAILevel: keyof typeof AI_LEVELS = "EXPERT"

    // 渲染单个消息
    const renderMessage = (message: any) => {
      const isUser = message.role === "user"
      const hasError = message.status === "error"
      const hasImages = message.images && message.images.length > 0

      // 格式化消息内容
      const formatContent = (content: any) => {
        if (typeof content === "string") {
          return content
        }
        if (React.isValidElement(content)) {
          return content
        }
        if (typeof content === "object") {
          if (content.content) {
            return content.content
          }
          try {
            return JSON.stringify(content, null, 2)
          } catch (error) {
            return "[无法显示的内容]"
          }
        }
        return String(content)
      }

      return (
        <div key={message.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4`}>
          <Avatar src={isUser ? user : mo2} className='flex-shrink-0' />
          <div
            className={cn(
              "flex flex-col max-w-[80%] rounded-lg p-3",
              isUser ? "bg-primary text-primary-foreground" : "bg-content2",
              hasError && "bg-danger-50 border border-danger-200",
              "overflow-hidden"
            )}
          >
            {message.status === "thinking" ? (
              <div className='flex items-center gap-2'>
                <Spinner size='sm'></Spinner>
                思考中...
              </div>
            ) : (
              <>
                <div className='whitespace-pre-wrap text-sm break-words w-full'>
                  {formatContent(message.content)}
                </div>
                {hasImages && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {message.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Message image ${index + 1}`}
                        className='w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => {
                          setSelectedImage(image)
                          setIsImagePreviewOpen(true)
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="flex w-full h-full">
          <div className="w-[35%] h-full">
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
                <div className='space-y-4 p-4'>{messages.map((message) => renderMessage(message))}</div>
              </ScrollShadow>

              <div className='p-2'>
                <AICommandInput onStop={onStop} agent={agent} onResult={onCommandResult} aiLevel={selectedAILevel} />
              </div>
            </div>
          </div>

          <div className="w-[65%] h-full bg-slate-50">
            <div className='relative h-full flex flex-col p-2'>
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
                  <div className='h-[calc(100vh-200px)] overflow-auto p-2'>{renderPreview()}</div>
                </Tab>
                {showCodeTab && <Tab key='code' title='代码视图' />}
              </Tabs>

              {selectedTab === "data" && showDataTab && (
                <div className='h-[calc(100vh-200px)] overflow-auto p-2'>{renderDataView?.()}</div>
              )}

              <CodeView appId={appId} showCodeTab={showCodeTab} selectedTab={selectedTab} />
            </div>
          </div>
        </div>

        {/* 图片预览Modal */}
        <Modal
          isOpen={isImagePreviewOpen}
          onClose={() => {
            setIsImagePreviewOpen(false)
            setSelectedImage("")
          }}
          size='4xl'
          classNames={{
            wrapper: "items-center",
          }}
        >
          <ModalContent>
            <div className='relative'>
              <img src={selectedImage} alt='Preview' className='w-full h-full object-contain max-h-[80vh]' />
              <Button
                isIconOnly
                className='absolute top-2 right-2'
                color='danger'
                variant='light'
                onClick={() => {
                  setIsImagePreviewOpen(false)
                  setSelectedImage("")
                }}
              >
                <Icon icon='mdi:close' className='w-6 h-6' />
              </Button>
            </div>
          </ModalContent>
        </Modal>
      </>
    )
  }
)

AIEditor.displayName = "AIEditor"

export default AIEditor