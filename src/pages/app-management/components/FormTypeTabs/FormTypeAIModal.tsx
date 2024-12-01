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
  Tooltip,
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
  const [assistantMessageId, setAssistantMessageId] = useState<string | null>(null)

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
      const newAssistantMessageId = (Date.now() + 1).toString()
      setAssistantMessageId(newAssistantMessageId)

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        id: newAssistantMessageId,
      }
      onUpdateHistory(formType, assistantMessage)

      let accumulatedContent = ""
      await chatMoV2(
        [
          {
            role: "system",
            content: `你是沙塔 AI 的智能数据分析助手，负责帮助用户分析和查询表单数据。
你需要理解用户的查询意图，从提供的数据中找出相关信息并给出准确的回答。
你只能回答与提供的数据相关的问题，对于超出数据范围的问题，你需要礼貌地拒绝回答。

分析原则：
1. 直接回答：直接给出用户想要的结果，不要过多解释
2. 数据准确：确保计算和统计的准确性
3. 简明扼要：使用简洁的语言表达结果
4. 灵活查询：支持多维度的数据查询和分析
5. 严格限制：只能回答数据集内的问题，拒绝回答超出范围的问题

注意事项：
- 所有表单都是系统自动生成的编号，不需要考虑编号的合理性
- 如果涉及金额，保留两位小数
- 如果涉及日期，使用标准格式
- 输出表单编号，订单号的时候，使用 <a target="_blank" href="/form/这里是表单编号">表单编号</a> 格式
- 如果数据不存在或查询条件不明确，要明确告知用户
- 如果用户询问的内容超出数据范围，要礼貌拒绝并说明原因

当前的时间是: ${new Date().toLocaleTimeString()}\n

这是你要分析的数据:\n${context}\n`,
          },
          ...(chatHistory?.messages || []),
          userMessage,
        ],
        (chunk) => {
          accumulatedContent += chunk
          onUpdateHistory(formType, {
            role: "assistant",
            content: accumulatedContent,
            id: newAssistantMessageId,
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
      setAssistantMessageId(null)
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
      size='2xl'
      scrollBehavior='inside'
      classNames={{
        base: "h-[80vh]",
        header: "border-b",
        body: "py-6",
        footer: "border-t",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex justify-between items-center'>
          <span>AI 分析助手</span>
          <Button isIconOnly color='warning' variant='light' onPress={() => onClearHistory(formType)}>
            <Icon icon='mdi:delete-sweep' width='24' height='24' />
          </Button>
        </ModalHeader>
        <ModalBody>
          <ScrollShadow className='flex-grow mb-4 pr-2'>
            <AnimatePresence mode='wait'>
              {(chatHistory?.messages || []).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageCard
                    avatar={message.role === "assistant" ? mo2 : user}
                    message={message.content || (message.id === assistantMessageId ? "正在思考..." : "")}
                    role={message.role}
                    status={message.id === assistantMessageId ? "streaming" : "success"}
                    className='mb-4'
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <div className='flex items-end gap-2 w-full'>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入分析指令，例如: '统计所有表单的状态分布'"
              className='flex-grow'
              classNames={{
                input: "py-2 text-medium",
                inputWrapper: "bg-default-100",
              }}
              minRows={2}
              maxRows={4}
              endContent={
                <div className='flex items-center gap-2 pr-2'>
                  <Tooltip content='发送指令' placement='top'>
                    <Button
                      isIconOnly
                      className={!input || isLoading ? "" : "bg-primary"}
                      color={!input || isLoading ? "default" : "primary"}
                      isDisabled={!input || isLoading}
                      radius='full'
                      variant={!input || isLoading ? "flat" : "solid"}
                      onClick={handleSendMessage}
                      isLoading={isLoading}
                    >
                      {isLoading ? (
                        <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                      ) : (
                        <Icon
                          className={!input ? "text-default-500" : "text-white"}
                          icon='solar:arrow-up-linear'
                          width={20}
                        />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              }
            />
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
