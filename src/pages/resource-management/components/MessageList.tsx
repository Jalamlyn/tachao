import React from "react"
import { ScrollShadow } from "@nextui-org/react"
import MessageCard from "@/components/MessageCard"
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
  code?: {
    preview?: React.ReactNode
    content?: string
  }
}

interface MessageListProps {
  messages: Message[]
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <ScrollShadow className='flex-1 overflow-y-auto'>
      <div className='space-y-4'>
        {messages.map((message) => (
          <div key={message.id}>
            <MessageCard
              avatar={message.role === "assistant" ? mo2 : user}
              message={message.content}
              role={message.role}
              status={message.status || "success"}
              className='message-card'
            />
          </div>
        ))}
      </div>
    </ScrollShadow>
  )
}

export default MessageList