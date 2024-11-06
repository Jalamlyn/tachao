import React, { useState, useEffect, useRef } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  ScrollShadow,
  Tooltip,
  Chip,
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Textarea,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"
import message from "@/components/Message"
import MessageCard from "@/components/MessageCard"
import chatChunkClaude from "@/service/chat/chat-chunk-claude-office"

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
    if (formsRef.current?.length === 0) return message.error("数据为空，请先创建单据，不然 AI 无法为您工作")
    if (!input.trim() || isLoading) return

    const userMessage = {
      role: "user",
      content: input,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const assistantMessage = {
        role: "assistant",
        content: "",
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // 直接使用 chatChunkClaude 处理消息
      await chatChunkClaude(
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
- 所有单据都是系统自动生成的编号，不需要考虑编号的合理性
- 如果涉及金额，保留两位小数
- 如果涉及日期，使用标准格式
- 输出单据编号，订单号的时候，使用 <a target="_blank" href="/form/这里是单据编号">单据编号</a> 格式
- 如果数据不存在或查询条件不明确，要明确告知用户
- 如果用户询问的内容超出数据范围，要礼貌拒绝并说明原因

当前的时间是: ${new Date().toLocaleTimeString()}\n

这是你要分析的数据:\n${JSON.stringify(formsRef.current)}\n\n`,
          },
          ...messages,
          userMessage,
        ],
        (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === "assistant") {
              lastMessage.content += chunk
            }
            return [...newMessages]
          })
        },
        () => {},
        true,
        0.7
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
          <ScrollShadow className='flex-grow h-[calc(100vh-400px)] mb-4'>
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
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='输入分析指令，例如: "统计所有单据的状态分布"'
              className='flex-grow'
              classNames={{
                input: "py-2 text-medium",
                inputWrapper: "bg-default-100",
              }}
              minRows={1}
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
        </CardBody>
      </Card>
    </div>
  )
}

export default FormAnalysis
