import React from "react"
import { motion } from "framer-motion"

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

interface AIReportMessagesProps {
  messages: Message[]
}

export function AIReportMessages({ messages }: AIReportMessagesProps) {
  return (
    <div className='space-y-4'>
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex gap-4 p-4 rounded-lg ${
            message.role === "user" ? "bg-primary/10" : "bg-background border border-border"
          }`}
        >
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-sm text-muted-foreground'>{message.timestamp}</span>
              {message.status === "success" && (
                <span className='text-sm text-success'>成功</span>
              )}
              {message.status === "error" && (
                <span className='text-sm text-danger'>错误</span>
              )}
            </div>
            <div className='prose prose-sm max-w-none'>{message.content}</div>
            {message.code?.preview && (
              <div className='mt-4 p-4 rounded-lg bg-muted'>
                {message.code.preview}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}