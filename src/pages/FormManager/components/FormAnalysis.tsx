import React, { useState, useEffect, useRef } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Textarea,
  ScrollShadow,
  Spinner,
  Skeleton,
  Tooltip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import chatChunkClaude from "@/service/chat/chat-chunk-claude-office"
import message from "@/components/Message"
import MessageCard from "@/components/MessageCard"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

const FormAnalysis: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [input, setInput] = useState("")
  const [processedData, setProcessedData] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const { fetchForms } = useFormMetadata()

  useEffect(() => {
    fetchFormsData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchFormsData = async () => {
    setIsInitialLoading(true)
    try {
      const forms = await fetchForms()
      setProcessedData(forms)

      const contextData = forms.map((form) => JSON.stringify(form)).join("\n")
      setContext(contextData)

      if (!forms || forms.length === 0) {
        setError("暂无可分析的单据数据")
      } else {
        setError(null)
      }
    } catch (error) {
      console.error("Error fetching forms data:", error)
      setError("获取表单数据时发生错误。请稍后再试。")
    } finally {
      setIsInitialLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || error) return

    const userMessage = { role: "user", content: input, id: Date.now().toString() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const assistantMessage = { role: "assistant", content: "", id: (Date.now() + 1).toString() }
      setMessages((prev) => [...prev, assistantMessage])

      await chatChunkClaude(
        [
          {
            role: "system",
            content: `你是一个智能查询助手，这是你要查询的单据数据:\n${context}，对于用户的查询，你要言简意赅的回复，尽量直接回复用户结果，不要过多的解释，用户没有要求列出详细数据，就一句话给出直接结果，你只负责帮助用户查询单据数据，其他指令和需求你都一律不接受，礼貌的拒绝用户，如果返回结果包含订单编号，那么就用一个 a 标签包裹，链接地址是"/forms/订单编号" 点击新开一个窗口`,
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
            return newMessages
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
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full gap-4 p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Icon icon="solar:notebook-broken" className="w-24 h-24 text-default-300" />
      </motion.div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-default-700">暂无可分析的单据</h3>
        <p className="text-default-500">请先创建一些单据，AI 助手才能帮您进行数据分析</p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          color="primary"
          variant="shadow"
          startContent={<Icon icon="solar:add-circle-bold" />}
          onClick={() => window.location.href = '/we-chat-app/admin/forms'}
        >
          创建单据
        </Button>
      </motion.div>
    </motion.div>
  )

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
                {messages.filter(m => m.role === "user").length}
              </Chip>
            </Tooltip>
          </motion.div>
        </CardHeader>

        <CardBody className='p-4 flex flex-col'>
          {isInitialLoading ? (
            <div className='flex-grow space-y-4'>
              <Skeleton className='rounded-lg'>
                <div className='h-24 rounded-lg bg-default-300'></div>
              </Skeleton>
              <Skeleton className='rounded-lg'>
                <div className='h-24 rounded-lg bg-default-300'></div>
              </Skeleton>
              <Skeleton className='rounded-lg'>
                <div className='h-24 rounded-lg bg-default-300'></div>
              </Skeleton>
            </div>
          ) : error ? (
            <EmptyState />
          ) : (
            <>
              <ScrollShadow className='flex-grow mb-4 pr-2 min-h-[400px]'>
                <AnimatePresence>
                  {messages.map((message, index) => (
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
                  isDisabled={error !== null}
                  endContent={
                    <div className='flex items-center gap-2 pr-2'>
                      <Tooltip content={error || '发送指令'} placement='top'>
                        <Button
                          isIconOnly
                          className={!input || isLoading ? "" : "bg-primary"}
                          color={!input || isLoading ? "default" : "primary"}
                          isDisabled={!input || isLoading || error !== null}
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
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default FormAnalysis