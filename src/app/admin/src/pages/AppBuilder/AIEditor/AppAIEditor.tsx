import React, { useState, useEffect, useCallback, useRef } from "react"
import AICommandInput from "./components/AICommandInput"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import pm from "/assets/pm.png" // 需要添加产品经理头像
import { Tabs, Tab, Button, ScrollShadow, Avatar, Spinner, Modal, ModalContent, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { AI_LEVELS, AIEditorProps } from "./type"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../store/appCodeStore"
import { CodeView } from "./components/CodeView"
import { motion } from "framer-motion"

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
    onVersionChange,
  }) => {
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState("")
    const [isFullWidth, setIsFullWidth] = useState(false)
    const selectedAILevel: keyof typeof AI_LEVELS = "EXPERT"

    // 添加实际显示内容的状态
    const [actualTab, setActualTab] = useState(selectedTab)

    // 添加消息容器的ref
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

    // 监听选中标签变化，延迟更新实际显示的内容
    useEffect(() => {
      const timer = setTimeout(() => {
        setActualTab(selectedTab)
      }, 500)
      return () => clearTimeout(timer)
    }, [selectedTab])

    // 滚动到底部的函数
    const scrollToBottom = useCallback(() => {
      if (shouldAutoScroll && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, [shouldAutoScroll])

    // 监听消息变化，自动滚动
    useEffect(() => {
      requestAnimationFrame(scrollToBottom)
    }, [messages.length])

    // 监听滚动事件
    useEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container
        // 如果用户向上滚动超过200px，则禁用自动滚动
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
        setShouldAutoScroll(isNearBottom)
      }

      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }, [])

    // 获取消息发送者的头像和角色信息
    const getMessageSenderInfo = (message: any) => {
      const isUser = message.role === "user"
      if (isUser) {
        return { avatar: user, role: "用户" }
      }

      // 根据消息内容判断是哪个AI助手
      const isPM = message.content.toLowerCase().includes("@pm")
      return {
        avatar: isPM ? pm : mo2,
        role: isPM ? "产品经理" : "工程师",
        roleColor: isPM ? "success" : "primary",
      }
    }

    // 渲染单个消息
    const renderMessage = (message: any) => {
      const isUser = message.role === "user"
      const hasError = message.status === "error"
      const hasImages = message.content.images && message.content.images.length > 0
      const senderInfo = getMessageSenderInfo(message)

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
          <div className='flex flex-col items-center gap-1'>
            <Avatar src={senderInfo.avatar} className='flex-shrink-0' />
            {!isUser && (
              <Chip size='sm' variant='flat' color={senderInfo.roleColor} className='text-tiny'>
                {senderInfo.role}
              </Chip>
            )}
          </div>
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
                <div className='whitespace-pre-wrap text-sm break-words w-full'>{formatContent(message.content)}</div>
                {hasImages && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {message.content.images.map((image: string, index: number) => (
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
        <div className='flex w-full h-full'>
          <motion.div
            animate={{ width: isFullWidth ? "0%" : "35%" }}
            transition={{ duration: 0.3 }}
            className='h-full'
            style={{ overflow: isFullWidth ? "hidden" : "visible" }}
          >
            <div className='h-full flex flex-col'>
              <div className='flex justify-between items-center p-2 border-b mb-2'>
                <div className='flex items-center gap-4'></div>
                <div className='flex items-center gap-2'>
                  {!shouldAutoScroll && (
                    <Button
                      size='sm'
                      variant='light'
                      onClick={() => {
                        setShouldAutoScroll(true)
                        scrollToBottom()
                      }}
                      startContent={<Icon icon='mdi:arrow-down' className='w-4 h-4' />}
                    >
                      滚动到底部
                    </Button>
                  )}
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
              </div>
              <ScrollShadow className='flex-1 overflow-y-auto pb-9' ref={scrollContainerRef}>
                <div className='space-y-4 p-4'>
                  {messages.map((message) => renderMessage(message))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollShadow>

              <div className='p-2'>
                <AICommandInput onStop={onStop} agent={agent} onResult={onCommandResult} aiLevel={selectedAILevel} />
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ width: isFullWidth ? "100%" : "65%" }}
            transition={{ duration: 0.3 }}
            className='h-full bg-slate-50'
          >
            <div className='relative h-full flex flex-col p-2'>
              <div className='version-control-wrapper absolute -top-2 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 transition-all duration-200 hover:bg-white z-50'>
                <div className='flex items-center gap-3'>
                  <div className='version-controls flex items-center gap-1'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => appCodeStore.rollback(onVersionChange)}
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
                      onClick={() => appCodeStore.forward(onVersionChange)}
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
                  {actualTab === "preview" && (
                    <div className='h-[calc(100vh-200px)] overflow-auto p-2'>{renderPreview()}</div>
                  )}
                </Tab>
                {showCodeTab && <Tab key='code' title='WebIDE' />}
              </Tabs>

              {actualTab === "data" && showDataTab && (
                <div className='h-[calc(100vh-200px)] overflow-auto p-2'>{renderDataView?.()}</div>
              )}

              <CodeView
                appId={appId}
                showCodeTab={showCodeTab}
                selectedTab={actualTab}
                isFullWidth={isFullWidth}
                onFullWidthChange={setIsFullWidth}
              />
            </div>
          </motion.div>
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
