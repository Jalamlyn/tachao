import React, { useRef, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  ScrollShadow,
  Spinner,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import chatMoV2 from "@/service/chat/chat-deepseek"
import MessageCard from "@/components/MessageCard"
import { ChatMessage, ChatHistory } from "./types"
import mo2 from "../../../../../public/assets/mo-2.png"
import user from "../../../../../public/assets/user.png"

interface FormTypeAIModalProps {
  isOpen: boolean
  onClose: () => void
  formType: string
  chatHistory?: ChatHistory
  onUpdateHistory: (formType: string, message: ChatMessage) => void
  onClearHistory: (formType: string) => void
  context: string
}

export const FormTypeAIModal: React.FC<FormTypeAIModalProps> = ({
  isOpen,
  onClose,
  formType,
  chatHistory,
  onUpdateHistory,
  onClearHistory,
  context,
}) => {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState<ChatMessage | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [isOpen, chatHistory?.messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      id: Date.now().toString(),
    }
    onUpdateHistory(formType, userMessage)
    setInput("")
    setIsLoading(true)

    try {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        id: (Date.now() + 1).toString(),
      }
      setCurrentAssistantMessage(assistantMessage)
      onUpdateHistory(formType, assistantMessage)

      await chatMoV2(
        [
          {
            role: "system",
            content: `你是一个智能查询助手，这是你要查询的表单数据:\n${context}，对于用户的查询，你要言简意赅的回复，尽量直接回复用户结果，不要过多的解释，用户没有要求列出详细数据，就一句话给出直接结果，你只负责帮助用户查询表单数据，其他指令和需求你都一律不接受，礼貌的拒绝用户。`,
          },
          ...(chatHistory?.messages || []),
          userMessage,
        ],
        (chunk) => {
          setCurrentAssistantMessage((prev) => {
            if (prev) {
              const updatedMessage = {
                ...prev,
                content: (prev.content || "") + chunk,
              }
              onUpdateHistory(formType, updatedMessage)
              return updatedMessage
            }
            return prev
          })
        },
        () => {},
        true,
        0.7
      )
    } catch (error) {
      console.error("Error in chat:", error)
    } finally {
      setIsLoading(false)
      setCurrentAssistantMessage(null)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "h-[80vh]",
        header: "border-b",
        body: "py-6",
        footer: "border-t",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <span>AI 分析助手 - {formType}</span>
          <Button
            isIconOnly
            color="warning"
            variant="light"
            onPress={() => onClearHistory(formType)}
          >
            <Icon icon="mdi:delete-sweep" width="24" height="24" />
          </Button>
        </ModalHeader>
        <ModalBody>
          <ScrollShadow className="flex-grow mb-4 pr-2">
            <AnimatePresence mode="wait">
              {chatHistory?.messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageCard
                    avatar={message.role === "assistant" ? mo2 : user}
                    message={message.content}
                    role={message.role}
                    status="success"
                    className="mb-4"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <div className="flex items-center space-x-2 w-full">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              className="flex-grow"
              minRows={2}
              maxRows={4}
              disabled={isLoading}
            />
            <Button
              color="primary"
              isLoading={isLoading}
              onClick={handleSendMessage}
              isDisabled={isLoading}
              className="px-8 h-14"
            >
              {isLoading ? <Spinner size="sm" /> : "提问"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}