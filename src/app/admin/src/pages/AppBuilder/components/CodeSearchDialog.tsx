import React, { useState, useRef, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  ScrollShadow,
  Avatar
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CodeSearchAgent from "../agents/CodeSearchAgent"
import message from "@/components/Message"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface CodeSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  appId: string
}

const CodeSearchDialog: React.FC<CodeSearchDialogProps> = ({
  isOpen,
  onClose,
  appId
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && appId) {
      CodeSearchAgent.initializeContext(appId).catch((error) => {
        message.error("初始化代码搜索失败")
        console.error(error)
      })
    }
  }, [isOpen, appId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = { role: "user", content: inputValue }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      let currentResponse = ""
      await CodeSearchAgent.chat(inputValue, (chunk: string) => {
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
      message.error("对话出错了，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Icon icon="solar:bot-linear" className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold">AI 代码助手</span>
        </ModalHeader>
        <ModalBody>
          <ScrollShadow ref={scrollRef} className="h-[400px]">
            <div className="flex flex-col gap-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === "assistant" ? "" : "flex-row-reverse"
                  }`}
                >
                  <Avatar
                    src={
                      msg.role === "assistant"
                        ? "https://avatars.githubusercontent.com/u/30373425?v=3"
                        : ""
                    }
                    className="flex-shrink-0"
                  />
                  <div
                    className={`flex max-w-[80%] rounded-lg p-3 ${
                      msg.role === "assistant"
                        ? "bg-content2"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-default-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  AI正在思考...
                </div>
              )}
            </div>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入问题..."
              minRows={2}
              disabled={isLoading}
            />
            <Button
              isIconOnly
              color={inputValue ? "primary" : "default"}
              isDisabled={!inputValue || isLoading}
              onPress={handleSend}
            >
              <Icon icon="solar:arrow-up-linear" className="w-5 h-5" />
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CodeSearchDialog