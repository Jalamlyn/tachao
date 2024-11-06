import React, { useState, useEffect, useRef } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  ScrollShadow,
  Spinner,
  Tooltip,
  Chip,
  Breadcrumbs,
  BreadcrumbItem,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import FormAnalysisAgent from "@/service/agents/FormAnalysisAgent"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"
import CommandInput from "@/components/CommandInput"

const FormAnalysis: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [chatCount, setChatCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { items: forms, load: loadForms } = useMetadata("form")

  useEffect(() => {
    loadForms()
  }, [loadForms])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: "user", content: input, id: Date.now().toString() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await FormAnalysisAgent.processQuery(input, (chunk) => {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            return prev.map((msg) =>
              msg.id === lastMessage.id ? { ...msg, content: msg.content + chunk } : msg
            )
          }
          return [...prev, { role: "assistant", content: chunk, id: Date.now().toString() }]
        })
      }, forms)

      setChatCount((prev) => prev + 1)
    } catch (error) {
      console.error("Analysis error:", error)
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
    <div className='container mx-auto py-8'>
      <Card className='w-full shadow-lg'>
        <CardHeader className='flex justify-between items-center'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem href='/we-chat-app/admin/forms'>单据管理</BreadcrumbItem>
              <BreadcrumbItem>数据分析</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2'>
              <Icon icon='solar:chart-2-bold' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>数据分析</h2>
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
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-white ml-4"
                        : "bg-default-100 text-foreground mr-4"
                    }`}
                  >
                    <div
                      className='prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </ScrollShadow>

          <div className='flex items-end gap-2'>
            <CommandInput
              value={input}
              onChange={(value) => setInput(value)}
              onKeyDown={handleKeyDown}
              placeholder='输入分析指令，例如: "统计所有单据的状态分布"'
              className='flex-grow'
              isLoading={isLoading}
              onSubmit={handleSendMessage}
            />
            <Button
              color='primary'
              isLoading={isLoading}
              onClick={handleSendMessage}
              className='h-14'
              startContent={!isLoading && <Icon icon='solar:command-square-bold' />}
            >
              发送
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default FormAnalysis