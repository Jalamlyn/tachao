import React from "react"
import MessageCard from "@/components/MessageCard"
import { ScrollShadow } from "@nextui-org/react"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

interface Message {
  role: string
  content: string
  id: string
  timestamp: string
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
              status='success'
              className='mb-4'
            />
          </div>
        ))}
      </div>
    </ScrollShadow>
  )
}

export default MessageList