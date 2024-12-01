import { useState } from "react"
import { ChatMessage, ChatHistory } from "../types"

export const useChatHistory = () => {
  const [chatHistories, setChatHistories] = useState<Map<string, ChatHistory>>(new Map())

  const updateHistory = (formType: string, message: ChatMessage) => {
    setChatHistories(prev => {
      const newMap = new Map(prev)
      const history = newMap.get(formType) || { formType, messages: [] }
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