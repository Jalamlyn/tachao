import React, { useState, useRef, useEffect } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Input,
  Button,
  ScrollShadow,
  Avatar,
  Tooltip,
  Textarea,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import chatChunkDeepseek from "@/service/chat/chat-deepseek"
import message from "@/components/Message"
import { cn } from "@nextui-org/react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIChatProps {
  isOpen: boolean
  onClose: () => void
  systemPrompt?: string
}

const defaultSystemPrompt = `我是即想 AI 助手,一个专门协助您使用即想平台的智能助手。我可以:

1. 功能咨询和指导
- 解答系统功能相关问题
- 提供操作步骤指导
- 推荐最佳使用实践

2. 开发建议
- 提供应用开发建议
- 解答开发相关问题
- 协助代码编写和调试

3. 问题诊断
- 帮助排查使用问题
- 提供解决方案建议
- 收集问题反馈

您可以这样和我对话:

示例 1: 功能咨询
用户: "如何创建一个新应用?"
我会: 为您详细介绍创建应用的步骤和注意事项

示例 2: 开发帮助
用户: "我想开发一个员工管理系统,有什么建议?"
我会: 帮您分析需求,提供开发建议和具体实施方案

示例 3: 问题排查
用户: "为什么我的应用发布失败了?"
我会: 引导您提供更多信息,帮助诊断和解决问题

您可以直接描述您的需求或问题,我会:
1. 理解您的需求
2. 提供清晰的解答
3. 必要时请求更多信息
4. 跟进确认问题是否解决

现在,请告诉我您需要什么帮助?`

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, systemPrompt = defaultSystemPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<(() => void) | null>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: systemPrompt }])
    }
  }, [isOpen, systemPrompt])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = { role: "user", content: inputValue }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      let currentResponse = ""
      const allMessages = [...messages, userMessage]

      await chatChunkDeepseek(
        allMessages,
        (chunk: string) => {
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
        },
        (cancelFn) => {
          abortControllerRef.current = cancelFn
        }
      )
    } catch (error) {
      if (error.name !== "AbortError") {
        message.error("对话出错了，请重试")
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClose = () => {
    onClose()
    setMessages([])
  }

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} placement='right' size='lg'>
      <DrawerContent>
        <DrawerHeader className='flex items-center gap-2 border-b'>
          <Icon icon='solar:bot-linear' className='w-6 h-6 text-primary' />
          <span className='text-lg font-semibold'>即想AI 助手, 有任何问题都可以问我</span>
        </DrawerHeader>
        <DrawerBody>
          <ScrollShadow ref={scrollRef} className='h-full'>
            <div className='flex flex-col gap-4 p-4'>
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                  <Avatar
                    src={msg.role === "assistant" ? "https://avatars.githubusercontent.com/u/30373425?v=3" : ""}
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
              {isLoading && (
                <div className='flex items-center gap-2 text-sm text-default-400'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                  AI正在思考...
                </div>
              )}
            </div>
          </ScrollShadow>
        </DrawerBody>
        <DrawerFooter className='border-t'>
          <form className='flex w-full items-start gap-2'>
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='输入消息...'
              minRows={2}
              variant='bordered'
              disabled={isLoading}
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "shadow-xl",
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focus=true]:bg-default-200/50",
                  "dark:group-data-[focus=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              endContent={
                <div className='flex gap-2'>
                  {isLoading ? (
                    <Button isIconOnly variant='light' color='danger' onClick={() => abortControllerRef.current?.()}>
                      <Icon icon='solar:close-circle-bold' className='w-5 h-5' />
                    </Button>
                  ) : (
                    <Tooltip showArrow content='发送消息'>
                      <Button
                        isIconOnly
                        color={!inputValue ? "default" : "primary"}
                        isDisabled={!inputValue}
                        radius='full'
                        size='sm'
                        variant={!inputValue ? "flat" : "solid"}
                        onClick={handleSend}
                      >
                        <Icon
                          className={cn(
                            "[&>path]:stroke-[2px]",
                            !inputValue ? "text-default-500" : "text-primary-foreground"
                          )}
                          icon='solar:arrow-up-linear'
                          width={20}
                        />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              }
            />
          </form>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default AIChat
