import React, { useState, useEffect, useRef } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  ScrollShadow,
  Spinner,
  Tooltip,
  Chip,
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Input,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import FormAnalysisAgent from "@/service/agents/FormAnalysisAgent"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"
import message from "@/components/Message"
import CommandInput from "@/components/CommandInput"
import MessageCard from "@/components/MessageCard"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

const FormAnalysis: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [chatCount, setChatCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { fetchForms } = useFormMetadata()
  const formsRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      formsRef.current = await fetchForms()
    }
    fetchData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { 
      role: "user", 
      content: input, 
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const assistantMessage = { 
        role: "assistant", 
        content: "", 
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages((prev) => [...prev, assistantMessage])

      // 使用新的 streamResponse 方法
      await FormAnalysisAgent.streamResponse(
        input,
        (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === "assistant") {
              lastMessage.content += chunk
            }
            return newMessages
          })
        },
        formsRef.current
      )

      setChatCount((prev) => prev + 1)
    } catch (error) {
      console.error("Error in chat:", error)
      message.error("分析过程中发生错误")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className='container mx-auto pt-10 pl-2'>
      <Card className='w-full shadow-lg'>
        <CardHeader className='flex justify-between items-center'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem href='/we-chat-app/admin/forms'>单据管理</BreadcrumbItem>
              <BreadcrumbItem>数据分析</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2 mt-2'>
              <Icon icon='solar:chart-2-bold' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>AI 智能数据分析</h2>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Tooltip content='对话次数' placement='left'>
              <Chip
                variant='shadow'
                classNames={{
                  base: "bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
                  content: "drop-shadow shadow-black text-white",
                }}
                startContent={<Icon icon='solar:chat-round-dots-bold' className='text-white' />}
              >
                {chatCount}
              </Chip>
            </Tooltip>
          </motion.div>
        </CardHeader>

        <CardBody className='p-4 flex flex-col gap-4'>
          <ScrollShadow className='flex-grow h-[500px] mb-4'>
            <AnimatePresence>
              {messages.map((message) => (
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
                    status='success'
                    className='mb-4'
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </ScrollShadow>

          <div className='flex items-end gap-2'>
            <CommandInput
              value={input}
              agent={FormAnalysisAgent}
              data={formsRef}
              onKeyDown={handleKeyDown}
              placeholder='输入分析指令，例如: "统计所有单据的状态分布"'
              className='flex-grow'
              onSubmit={handleSendMessage}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default FormAnalysis