import { useState } from "react"
import { ChatMessage, ChatHistory } from "../types"

export const useChatHistory = () => {
  const [chatHistories, setChatHistories] = useState<Map<string, ChatHistory>>(new Map())

  const updateHistory = (formType: string, message: ChatMessage) => {
    setChatHistories(prev => {
      const newMap = new Map(prev)
      const history = newMap.get(formType) || { formType, messages: [] }
      
      // 如果是助手消息且已存在，则更新最后一条消息
      if (message.role === "assistant" && history.messages.length > 0) {
        const lastMessage = history.messages[history.messages.length - 1]
        if (lastMessage.role === "assistant") {
          const updatedMessages = [...history.messages]
          updatedMessages[updatedMessages.length - 1] = message
          newMap.set(formType, {
            ...history,
            messages: updatedMessages
          })
          return newMap
        }
      }

      // 如果是新消息或用户消息，则添加到历史记录
      newMap.set(formType, {
        ...history,
        messages: [...history.messages, message]
      })
      return newMap
    })
  }

  const clearHistory = (formType: string) => {
    setChatHistories(prev => {
      const newMap = new Map(prev)
      newMap.delete(formType)
      return newMap
    })
  }

  return {
    chatHistories,
    updateHistory,
    clearHistory,
    getChatHistory: (formType: string) => chatHistories.get(formType)
  }
}