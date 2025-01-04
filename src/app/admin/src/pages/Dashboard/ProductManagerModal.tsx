import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  ScrollShadow,
  Textarea,
  Tooltip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProductAgent from "./ProductAgent"
import message from "@/components/Message"
import appAgent from "@/app/admin/src/pages/AppBuilder/AppAgent"

const MAX_INPUT_LENGTH = 2000

const ProductManagerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [inputValue, setInputValue] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isWaitingResponse, setIsWaitingResponse] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return

    const userMessage = { role: "user", content: inputValue }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsSending(true)
    setIsWaitingResponse(true)

    try {
      let currentResponse = ""
      let hasStartedResponse = false

      await ProductAgent.chat([...messages, userMessage], (chunk) => {
        if (!hasStartedResponse) {
          hasStartedResponse = true
          setIsWaitingResponse(false)
          setMessages((prev) => [...prev, { role: "assistant", content: "" }])
        }

        currentResponse += chunk
        setMessages((prev) => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: currentResponse,
          }
          return newMessages
        })
      })
    } catch (error) {
      console.error("Chat error:", error)
      message.error("对话出错了，请重试")
    } finally {
      setIsSending(false)
      setIsWaitingResponse(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleConfirmRequirement = async () => {
    if (messages.length < 2) {
      message.warning("请先与产品经理进行需求讨论")
      return
    }

    setIsConfirming(true)
    try {
      const requirement = ProductAgent.formatRequirementForAppAgent(messages)

      const result = await appAgent.processCommand("app_" + Date.now(), [], requirement, (chunk) => {
        console.log("Processing chunk:", chunk)
      })

      if (result.success) {
        message.success("需求已确认，正在为您创建应用...")
        onClose()
        navigate(`/admin/apps/${result.version.appId}/builder`)
      } else {
        throw new Error(result.error || "处理需求时发生错误")
      }
    } catch (error) {
      console.error("Error processing requirement:", error)
      message.error(error instanceof Error ? error.message : "处理需求时发生错误")
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='3xl'
      classNames={{
        base: "h-[80vh]",
        backdrop: "backdrop-blur-sm",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <div className='flex flex-col h-full'>
            <ModalHeader className='flex flex-col gap-1 border-b'>
              <div className='flex items-center gap-3'>
                <div className='relative'>
                  <Avatar
                    src='https://avatars.githubusercontent.com/u/30373425?v=4'
                    className='w-10 h-10 border-2 border-primary'
                  />
                  <div className='absolute -bottom-1 -right-1 bg-success rounded-full w-4 h-4 border-2 border-white' />
                </div>
                <div>
                  <h3 className='text-xl font-bold'>AI产品经理</h3>
                  <p className='text-sm text-default-500'>专业需求分析 | 产品规划 | 用户体验</p>
                </div>
              </div>
            </ModalHeader>

            <div className='flex-1 min-h-0 flex flex-col'>
              <ScrollShadow ref={scrollRef} className='flex-1 space-y-6 p-6 overflow-y-auto'>
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}
                    >
                      <div className='flex-shrink-0 pt-1'>
                        <Avatar
                          src={msg.role === "assistant" ? "https://avatars.githubusercontent.com/u/30373425?v=4" : ""}
                          className={`w-8 h-8 ${msg.role === "user" ? "bg-primary text-white" : ""}`}
                          fallback={
                            msg.role === "user" ? (
                              <Icon icon='solar:user-circle-linear' className='w-6 h-6' />
                            ) : undefined
                          }
                        />
                      </div>
                      <div className={`flex max-w-[80%] flex-col gap-1`}>
                        <span className='text-xs text-default-400'>
                          {msg.role === "assistant" ? "AI产品经理" : "您"}
                        </span>
                        <div
                          className={`rounded-xl p-4 ${
                            msg.role === "assistant" ? "bg-content2 shadow-sm" : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className='whitespace-pre-wrap text-sm leading-relaxed'>{msg.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isWaitingResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className='flex items-center gap-2 text-sm text-default-400'
                    >
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent'></div>
                      正在思考...
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollShadow>

              <div className='p-4 border-t bg-content1'>
                <form className='flex flex-col items-start rounded-medium bg-default-100 transition-colors hover:bg-default-200/70'>
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='请描述您的需求，例如：我想开发一个电商平台...'
                    minRows={3}
                    maxRows={5}
                    variant='flat'
                    radius='lg'
                    disabled={isSending}
                    maxLength={MAX_INPUT_LENGTH}
                    classNames={{
                      inputWrapper: "!bg-transparent shadow-none",
                      innerWrapper: "relative",
                      input: "pt-1 pl-2 pb-6 !pr-10 text-medium",
                    }}
                    endContent={
                      <div className='flex items-end gap-2 absolute bottom-2 right-2'>
                        <Tooltip showArrow content='发送消息'>
                          <Button
                            isIconOnly
                            color={!inputValue.trim() ? "default" : "primary"}
                            isDisabled={!inputValue.trim() || isSending}
                            radius='lg'
                            size='sm'
                            variant='solid'
                            onPress={handleSend}
                          >
                            <Icon
                              className={!inputValue.trim() ? "text-default-600" : "text-primary-foreground"}
                              icon='solar:arrow-up-linear'
                              width={20}
                            />
                          </Button>
                        </Tooltip>
                      </div>
                    }
                  />
                </form>
              </div>
            </div>

            <ModalFooter className='border-t bg-content1'>
              <Button
                color='primary'
                variant='light'
                onPress={onClose}
                startContent={<Icon icon='solar:close-circle-linear' className='w-4 h-4' />}
              >
                稍后再说
              </Button>
              <Button
                color='primary'
                startContent={<Icon icon='solar:rocket-linear' className='w-4 h-4' />}
                endContent={messages.length < 2 ? undefined : <span>({messages.length}条对话)</span>}
                onPress={handleConfirmRequirement}
                isLoading={isConfirming}
                isDisabled={messages.length < 2 || isConfirming}
              >
                确认需求并创建应用
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ProductManagerModal
