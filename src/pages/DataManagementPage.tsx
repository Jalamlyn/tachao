import React, { useState, useEffect, useCallback } from "react"
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

const DataManagementPage: React.FC = () => {
  const [context, setContext] = useState("")
  const [currentMessage, setCurrentMessage] = useState<any>(null)
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

  const fetchFormsData = useCallback(async () => {
    setIsInitialLoading(true)
    try {
      const forms = await fetchForms()
      setProcessedData(forms)

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
    setCurrentMessage(userMessage)
    setInput("")
    setIsLoading(true)

    try {
      const assistantMessage = { role: "assistant", content: "", id: (Date.now() + 1).toString() }
      setCurrentMessage(assistantMessage)

      await chatMoV2(
        [
          {
            role: "system",
            content: `你是一个智能查询助手，这是你要查询的单据数据:\n${context}，对于用户的查询，你要言简意赅的回复，尽量直接回复用户结果，不要过多的解释，用户没有要求列出详细数据，就一句话给出直接结果，你只负责帮助用户查询单据数据，其他指令和需求你都一律不接受，礼貌的拒绝用户，如果返回结果包含订单编号，那么就用一个 a 标签包裹，链接地址是"/forms/订单编号" 点击新开一个窗口`,
          },
          userMessage,
        ],
        (chunk) => {
          setCurrentMessage((prev: any) => ({
            ...prev,
            content: prev.content + chunk,
          }))
        },
        () => {},
        true,
        0.7
      )
    } catch (error) {
      console.error("Error in chat:", error)
      setError("聊天过程中发生错误。")
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
    <div className='container mx-auto p-4 md:p-6 h-screen flex flex-col'>
      <Card className='w-full h-full shadow-lg rounded-lg flex flex-col'>
        <CardHeader className='flex justify-between items-center p-4 text-white'>
          <h1 className='text-2xl font-bold'>数据管理助手</h1>
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
            </div>
          ) : error ? (
            <div className='flex-grow flex items-center justify-center'>
              <p className='text-danger text-center'>{error}</p>
            </div>
          ) : (
            <ScrollShadow className='flex-grow mb-4 pr-2'>
              <AnimatePresence mode="wait">
                {currentMessage && (
                  <motion.div
                    key={currentMessage.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageCard
                      avatar={currentMessage.role === "assistant" ? mo2 : user}
                      message={currentMessage.content}
                      role={currentMessage.role}
                      status='success'
                      className='mb-4'
                    />
                  </motion.div>
                )}
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

export default DataManagementPage