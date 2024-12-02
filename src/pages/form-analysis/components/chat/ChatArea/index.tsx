import React from "react"
import { ScrollShadow, Textarea, Button, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import MessageCard from "@/components/MessageCard"
import { ChatSession } from "../../../store/useChatStore"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

interface ChatAreaProps {
  session: ChatSession | null
  onSendMessage: (content: string) => Promise<void>
  onNewChat: () => void
  isLoading?: boolean
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  onSendMessage,
  onNewChat,
  isLoading = false,
}) => {
  const [input, setInput] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [session?.messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const content = input
    setInput("")
    await onSendMessage(content)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon icon="mdi:chat-plus" className="w-16 h-16 mx-auto text-primary/50" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">开始新的对话</h3>
            <p className="text-default-500">点击左侧"新建会话"或下方按钮开始</p>
            <Button 
              color="primary"
              size="lg"
              startContent={<Icon icon="mdi:plus" />}
              onPress={onNewChat}
            >
              新建会话
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ScrollShadow className="flex-1 p-4">
        {session.messages.map((message) => (
          <MessageCard
            key={message.id}
            avatar={message.role === "assistant" ? mo2 : user}
            message={message.content}
            role={message.role}
            status="success"
            className="mb-4"
          />
        ))}
        <div ref={messagesEndRef} />
      </ScrollShadow>

      <div className="p-4 border-t border-divider">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-grow"
            classNames={{
              input: "py-2 text-medium",
              inputWrapper: "bg-default-100",
            }}
            minRows={2}
            maxRows={4}
            endContent={
              <div className="flex items-center gap-2 pr-2">
                <Tooltip content="发送消息" placement="top">
                  <Button
                    isIconOnly
                    className={!input || isLoading ? "" : "bg-primary"}
                    color={!input || isLoading ? "default" : "primary"}
                    isDisabled={!input || isLoading}
                    radius="full"
                    variant={!input || isLoading ? "flat" : "solid"}
                    onClick={handleSend}
                    isLoading={isLoading}
                  >
                    {isLoading ? (
                      <Icon className="animate-spin" icon="eos-icons:loading" width={20} />
                    ) : (
                      <Icon
                        className={!input ? "text-default-500" : "text-white"}
                        icon="solar:arrow-up-linear"
                        width={20}
                      />
                    )}
                  </Button>
                </Tooltip>
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default ChatArea