import { create } from "zustand"
import { ReactNode } from "react"
import { debounce } from "lodash"

interface Message {
  role: string
  content: string | ReactNode
  id: string
  timestamp: string
  status?: string
}

interface ReportState {
  messages: Message[]
  selectedTab: string
  previewContent: string
  previewComponent: React.ReactNode | null
  currentTemplateIds: string[]
  activeDataTab: string
  templateInfoMap: Record<string, string>
  isLoadingTemplates: boolean
  isSuccessModalOpen: boolean
  savedReportId: string | null

  // Actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateLastMessage: (update: Partial<Message>) => void
  setSelectedTab: (tab: string) => void
  setPreviewContent: (content: string) => void
  setPreviewComponent: (component: React.ReactNode) => void
  setCurrentTemplateIds: (ids: string[]) => void
  setActiveDataTab: (tab: string) => void
  setTemplateInfoMap: (map: Record<string, string>) => void
  setIsLoadingTemplates: (loading: boolean) => void
  setIsSuccessModalOpen: (open: boolean) => void
  setSavedReportId: (id: string | null) => void
  clearMessages: () => void // 新增清空消息的action
}

const debouncedStateUpdate = debounce((set, messages) => {
  set({ messages })
}, 100)

export const useReportStore = create<ReportState>((set) => ({
  messages: [],
  selectedTab: "data",
  previewContent: "",
  previewComponent: null,
  currentTemplateIds: [],
  activeDataTab: "all",
  templateInfoMap: {},
  isLoadingTemplates: false,
  isSuccessModalOpen: false,
  savedReportId: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    const messageId = message.id || `message-${Date.now()}`
    const newMessage = {
      ...message,
      id: messageId,
      timestamp: new Date().toLocaleTimeString(),
    }

    set((state) => ({
      messages: [...state.messages, newMessage],
    }))

    return messageId
  },

  updateLastMessage: (update) => {
    set((state) => {
      const messages = [...state.messages]
      const lastIndex = messages.length - 1

      if (lastIndex >= 0) {
        messages[lastIndex] = {
          ...messages[lastIndex],
          ...update,
        }
        
        debouncedStateUpdate(set, messages)
      }

      return { messages }
    })
  },

  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setPreviewContent: (content) => set({ previewContent: content }),
  setPreviewComponent: (component) => set({ previewComponent: component }),
  setCurrentTemplateIds: (ids) => set({ currentTemplateIds: ids }),
  setActiveDataTab: (tab) => set({ activeDataTab: tab }),
  setTemplateInfoMap: (map) => set({ templateInfoMap: map }),
  setIsLoadingTemplates: (loading) => set({ isLoadingTemplates: loading }),
  setIsSuccessModalOpen: (open) => set({ isSuccessModalOpen: open }),
  setSavedReportId: (id) => set({ savedReportId: id }),
  clearMessages: () => set({ messages: [] }), // 新增清空消息的action
}))