import { useState, useCallback } from "react"
import { Icon } from "@iconify/react"

export interface Message {
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

export interface UseReportMessagesResult {
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  updateLastMessage: (update: Partial<Message>) => void
  clearMessages: () => void
}

export function useReportMessages(): UseReportMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  const updateLastMessage = useCallback((update: Partial<Message>) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      const lastMessage = prev[prev.length - 1]
      return [...prev.slice(0, -1), { ...lastMessage, ...update }]
    })
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    addMessage,
    updateLastMessage,
    clearMessages,
  }
}