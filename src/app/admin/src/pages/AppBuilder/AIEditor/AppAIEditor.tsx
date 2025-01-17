import React, { useState, useEffect, useCallback, useRef } from "react"
import AICommandInput from "./components/AICommandInput"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"
import pm from "/assets/pm.png"
import { Tabs, Tab, Button, ScrollShadow, Avatar, Spinner, Modal, ModalContent, Chip } from "@nextui-org/react"
import { useClipboard } from "@nextui-org/use-clipboard"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { AI_LEVELS, AIEditorProps } from "./type"
import { observer } from "mobx-react-lite"
import { appCodeStore } from "../store/appCodeStore"
import { CodeView } from "./components/CodeView"
import { motion } from "framer-motion"
import LogViewer from "./components/LogViewer"
import KnowledgeModal from "./components/KnowledgeModal"
import RequestView from "./components/RequestView"

const AIEditor: React.FC<AIEditorProps> = observer(
  ({
    onStop,
    messages,
    selectedTab,
    onTabChange,
    setMessages,
    onCommandResult,
    handleClearMessages,
    agent,
    renderPreview,
    renderDataView,
    showDataTab = false,
    showCodeTab = false,
    appId,
    onVersionChange,
  }) => {
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState("")
    const [isFullWidth, setIsFullWidth] = useState(false)
    const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false)
    const selectedAILevel: keyof typeof AI_LEVELS = "EXPERT"
    const [actualTab, setActualTab] = useState(selectedTab)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
    const { copy } = useClipboard()
    const isPM = useRef(false)

    useEffect(() => {
      const timer = setTimeout(() => {
        setActualTab(selectedTab)
      }, 500)
      return () => clearTimeout(timer)
    }, [selectedTab])

    const scrollToBottom = useCallback(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" })
      }
    }, [shouldAutoScroll])

    useEffect(() => {
      requestAnimationFrame(scrollToBottom)
    }, [messages.length])

    useEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
        setShouldAutoScroll(isNearBottom)
      }

      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }, [])

    const getMessageSenderInfo = (message: any) => {
      const isUser = message.role === "user"
      if (isUser) {
        isPM.current = message?.content?.content?.toLowerCase()?.includes("@pm")
        return { avatar: user, role: "用户" }
      }

      return {
        avatar: isPM.current ? pm : mo2,
        role: isPM.current ? "产品经理" : "工程师",
        roleColor: isPM.current ? "success" : "primary",
      }
    }

    const handleCopyMessage = async (message: any) => {
      let content = ""
      if (typeof message.content === "string") {
        content = message.content
      } else if (React.isValidElement(message.content)) {
        content = message.content.props.children?.toString() || ""
      } else if (typeof message.content === "object") {
        content = message.content.content || JSON.stringify(message.content, null, 2)
      }

      await copy(content)
    }

    const handleDeleteMessage = (messageId: string) => {
      const newMessages = messages.filter((msg) => msg.id !== messageId)
      setMessages(newMessages)
    }

    const renderMessage = (message: any) => {
      const isUser = message.role === "user"
      const hasError = message.status === "error"
      const hasImages = message.content.images && message.content.images.length > 0
      const senderInfo = getMessageSenderInfo(message)

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
        <div key={message.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4 group`}>
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
              "flex flex-col max-w-[600px] min-w-[200px] rounded-lg p-3 relative",
              isUser ? "bg-secondary-300 text-primary-foreground" : "bg-content2",
              hasError && "bg-danger-50 border border-danger-200",
              "overflow-hidden"
            )}
          >
            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
              <div className='flex gap-1'>
                <Button
                  isIconOnly
                  size='sm'
                  variant='light'
                  className={isUser ? "text-white/80 hover:text-white" : ""}
                  onClick={() => handleCopyMessage(message)}
                >
                  <Icon icon='mdi:content-copy' className='w-4 h-4' />
                </Button>
                <Button
                  isIconOnly
                  size='sm'
                  variant='light'
                  className={isUser ? "text-white/80 hover:text-white" : ""}
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  <Icon icon='mdi:delete' className='w-4 h-4' />
                </Button>
              </div>
            </div>

            {message.status === "thinking" ? (
              <div className='flex items-center gap-2'>
                <Spinner size='sm'></Spinner>
                思考中...
              </div>
            ) : (
              <>
                <div className='whitespace-pre-wrap text-sm break-words w-full pr-16'>
                  {formatContent(message.content)}
                </div>
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
                    onClick={() => setIsKnowledgeModalOpen(true)}
                    startContent={<Icon icon='solar:book-linear' className='w-4 h-4' />}
                  >
                    知识库
                  </Button>

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
                <div className='space-y-4 p-4 pr-6'>
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
              <div className='version-control-wrapper absolute -top-2 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 t-all duration-200 hover:bg-white z-50'>
                <div className='flex items-center gap-3'>
                  <div className='version-controls flex items-center gap-1'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => appCodeStore.rollback(onVersionChange)}
                      disabled={!appCodeStore.canRollback}
                      className={cn(
                        "h-8 w-8 p-0 rounded-full t-all duration-200",
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
                        "h-8 w-8 p-0 rounded-full t-all duration-200",
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
                <Tab
                  key='preview'
                  title={
                    <div className='flex items-center gap-2'>
                      <Icon icon='material-symbols:preview-outline' className='w-4 h-4' />
                      应用预览
                    </div>
                  }
                >
                  {actualTab === "preview" && (
                    <div className='h-[calc(100vh-200px)] overflow-auto p-2'>{renderPreview()}</div>
                  )}
                </Tab>
                {showCodeTab && (
                  <Tab
                    key='code'
                    title={
                      <div className='flex items-center gap-2'>
                        <Icon icon='fluent:code-js-16-filled' className='w-4 h-4' />
                        Code
                      </div>
                    }
                  />
                )}
                <Tab
                  key='logs'
                  title={
                    <div className='flex items-center gap-2'>
                      <Icon icon='mdi:console' className='w-4 h-4' />
                      控制台
                    </div>
                  }
                >
                  {actualTab === "logs" && (
                    <div className='h-[calc(100vh-200px)] overflow-auto p-2'>
                      <LogViewer />
                    </div>
                  )}
                </Tab>
                <Tab
                  key='data-view'
                  title={
                    <div className='flex items-center gap-2'>
                      <Icon icon='mdi:data' className='w-4 h-4' />
                      数据请求
                    </div>
                  }
                >
                  {actualTab === "data-view" && (
                    <div className='h-[calc(100vh-200px)] overflow-auto p-2'>
                      <RequestView></RequestView>
                    </div>
                  )}
                </Tab>
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

        <KnowledgeModal isOpen={isKnowledgeModalOpen} onClose={() => setIsKnowledgeModalOpen(false)} />
      </>
    )
  }
)

AIEditor.displayName = "AIEditor"

export default AIEditor
