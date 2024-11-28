import { create } from 'zustand'
import { ReactNode } from 'react'

interface Message {
  role: string
  content: string | ReactNode
  id: string
  timestamp: string
  status?: string
}

interface AIFormState {
  messages: Message[]
  selectedTab: string
  previewContent: string
  
  // actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setSelectedTab: (tab: string) => void
  setPreviewContent: (content: string) => void
  updateLastMessage: (update: Partial<Message>) => void
}

export const useAIFormStore = create<AIFormState>((set) => ({
  messages: [],
  selectedTab: "preview",
  previewContent: "",

  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  
  setPreviewContent: (content) => set({ previewContent: content }),
  
  updateLastMessage: (update) => set((state) => {
    const messages = [...state.messages]
    const lastIndex = messages.length - 1
    if (lastIndex >= 0) {
      messages[lastIndex] = {
        ...messages[lastIndex],
        ...update
      }
    }
    return { messages }
  })
}))