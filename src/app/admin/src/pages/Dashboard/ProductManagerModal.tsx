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
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import ProductAgent from "./ProductAgent"
import message from "@/components/Message"
import appAgent from "@/app/admin/src/pages/AppBuilder/AppAgent"

const ProductManagerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [inputValue, setInputValue] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
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

    try {
      let currentResponse = ""
      await ProductAgent.chat([...messages, userMessage], (chunk) => {
        currentResponse += chunk
        setMessages((prev) => {
          const newMessages = [...prev]
          if (newMessages[newMessages.length - 1]?.role === "assistant") {
            newMessages[newMessages.length - 1].content = currentResponse
          } else {
            newMessages.push({ role: "assistant", content: currentResponse })
          }
          return newMessages
        })
      })
    } catch (error) {
      console.error("Chat error:", error)
      message.error("对话出错了，请重试")
    } finally {
      setIsSending(false)
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

      // 创建一个新的应用并处理需求
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
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Avatar src='https://avatars.githubusercontent.com/u/30373425?v=4' className='w-8 h-8' />
            <div>
              <h3 className='text-xl font-bold'>AI产品经理</h3>
              <p className='text-sm text-default-500'>让我们一起讨论您的应用需求</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='flex flex-col h-full'>
            <ScrollShadow ref={scrollRef} className='flex-1 space-y-4 p-4'>
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                  <Avatar
                    src={msg.role === "assistant" ? "https://avatars.githubusercontent.com/u/30373425?v=4" : ""}
                    className='flex-shrink-0'
                  />
                  <div
                    className={`flex max-w-[80%] rounded-lg p-3 ${
                      msg.role === "assistant" ? "bg-content2" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className='whitespace-pre-wrap text-sm'>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className='flex items-center gap-2 text-sm text-default-400'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                  正在思考...
                </div>
              )}
            </ScrollShadow>

            <div className='p-4 border-t'>
              <form className='flex items-end gap-2'>
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='输入您的需求描述...'
                  minRows={2}
                  maxRows={5}
                  variant='bordered'
                  disabled={isSending}
                  classNames={{
                    input: "resize-none",
                  }}
                />
                <Button
                  isIconOnly
                  color={!inputValue ? "default" : "primary"}
                  isDisabled={!inputValue || isSending}
                  onPress={handleSend}
                >
                  <Icon icon='solar:arrow-up-linear' className='w-5 h-5' />
                </Button>
              </form>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' variant='light' onPress={onClose}>
            稍后再说
          </Button>
          <Button
            color='primary'
            startContent={<Icon icon='solar:rocket-linear' />}
            onPress={handleConfirmRequirement}
            isLoading={isConfirming}
            isDisabled={messages.length < 2 || isConfirming}
          >
            确认需求并创建应用
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProductManagerModal
