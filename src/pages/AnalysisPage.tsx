import React, { useState, useEffect, useRef, useCallback } from "react"
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
import chatMoV2 from "@/service/chat/chat-deepseek"
import MessageCard from "@/components/MessageCard"
import mo2 from "../../public/assets/mo-2.png"
import user from "../../public/assets/user.png"
import { getMetadata, queryMetadataHistory } from "@/service/apis/api"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"

const AnalysisPage: React.FC = () => {
  const [context, setContext] = useState("")
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

  const fetchFormsData = useCallback(async () => {
    setIsInitialLoading(true)
    try {
      // 使用 fetchForms 获取完整的表单数据
      const forms = await fetchForms()
      setProcessedData(forms)

      // 创建上下文数据
      const contextData = forms.map((form) => JSON.stringify(form)).join("\n")
      setContext(contextData)

      if (contextData.trim() === "") {
        setError("没有可用的数据进行分析。请先添加一些表单数据。")
      } else {
        setError(null)
      }
    } catch (error) {
      console.error("Error fetching forms data:", error)
      setError("获取表单数据时发生错误。请稍后再试。")
    } finally {
      setIsInitialLoading(false)
    }
  }, [fetchForms])

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

      await chatMoV2(
        [
          {
            role: "system",
            content: `你是一个智能查询助手，这是你要查询的表单数据:\n${context}，对于用户的查询，你要言简意赅的回复，尽量直接回复用户结果，不要过多的解释，用户没有要求列出详细数据，就一句话给出直接结果，你只负责帮助用户查询表单数据，其他指令和需求你都一律不接受，礼貌的拒绝用户，如果返回结果包含订单编号，那么就用一个 a 标签包裹，链接地址是“/forms/订单编号” 点击新开一个窗口`,
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

  return (
    <div className='container mx-auto p-4 md:p-6 h-screen flex flex-col'>
      <Card className='w-full h-full shadow-lg rounded-lg flex flex-col'>
        <CardHeader className='flex justify-between items-center p-4 text-white'>
          <h1 className='text-2xl font-bold'>经营分析助手</h1>
          <Tooltip content='清除聊天记录'>
            <Button isIconOnly color='warning' variant='light' onPress={clearChat} className='text-white'>
              <Icon icon='mdi:delete-sweep' width='24' height='24' />
            </Button>
          </Tooltip>
        </CardHeader>
        <CardBody className='p-4 flex-grow flex flex-col'>
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
            <div className='flex-grow flex items-center justify-center'>
              <p className='text-danger text-center'>{error}</p>
            </div>
          ) : (
            <ScrollShadow className='flex-grow mb-4 pr-2'>
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
                      className={`mb-4 `}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </ScrollShadow>
          )}
          <div className='flex items-center space-x-2 mt-4'>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='输入您的问题...'
              className='flex-grow'
              minRows={2}
              maxRows={4}
              disabled={isLoading || isInitialLoading || error !== null}
            />
            <Button
              color='primary'
              isLoading={isLoading}
              onClick={handleSendMessage}
              isDisabled={isLoading || isInitialLoading || error !== null}
              className='px-8 h-14'
            >
              {isLoading ? <Spinner size='sm' /> : "提问"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default AnalysisPage
