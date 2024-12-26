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

interface SavePendingState {
  resolve: (value: void | PromiseLike<void>) => void
  reject: (reason?: any) => void
  save: (title: string) => Promise<void>
}

interface VersionSavePendingState {
  resolve: (value: void | PromiseLike<void>) => void
  reject: (reason?: any) => void
  save: (useCurrentVersion: boolean) => Promise<void>
}

interface AIFormState {
  // 消息相关
  messages: Message[]
  selectedTab: string
  previewContent: string

  // 模态框状态
  isTitleModalOpen: boolean
  isVersionSelectModalOpen: boolean
  isSuccessModalOpen: boolean

  // 表单状态
  newTitle: string
  savedTemplateId: string | null
  pendingSave: SavePendingState | null
  pendingVersionSave: VersionSavePendingState | null

  // Actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setSelectedTab: (tab: string) => void
  setPreviewContent: (content: string) => void
  updateLastMessage: (update: Partial<Message>) => void

  // 模态框 actions
  setTitleModalOpen: (isOpen: boolean) => void
  setVersionSelectModalOpen: (isOpen: boolean) => void
  setSuccessModalOpen: (isOpen: boolean) => void

  // 表单 actions
  setNewTitle: (title: string) => void
  setSavedTemplateId: (id: string | null) => void
  setPendingSave: (state: SavePendingState | null) => void
  setPendingVersionSave: (state: VersionSavePendingState | null) => void

  // 复合 actions
  handleTitleConfirm: () => Promise<void>
  handleTitleCancel: () => void
  handleVersionSelectConfirm: (useCurrentVersion: boolean) => Promise<void>
  handleVersionSelectCancel: () => void
  clearMessages: () => void
}

// 创建防抖的状态更新函数
const debouncedStateUpdate = debounce((set, messages) => {
  set({ messages })
}, 1000)

export const useAIFormStore = create<AIFormState>((set, get) => ({
  // 初始状态
  messages: [],
  selectedTab: "preview",
  previewContent: "",

  isTitleModalOpen: false,
  isVersionSelectModalOpen: false,
  isSuccessModalOpen: false,

  newTitle: "",
  savedTemplateId: null,
  pendingSave: null,
  pendingVersionSave: null,

  // 基础 actions
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

  setSelectedTab: (tab) => set({ selectedTab: tab }),

  setPreviewContent: (content) => set({ previewContent: content }),

  updateLastMessage: (update) => {
    const state = get()
    const messages = [...state.messages]
    const lastIndex = messages.length - 1

    if (lastIndex >= 0) {
      messages[lastIndex] = {
        ...messages[lastIndex],
        ...update,
      }
      set({ messages })
    }
  },

  // 模态框 actions
  setTitleModalOpen: (isOpen) => set({ isTitleModalOpen: isOpen }),
  setVersionSelectModalOpen: (isOpen) => set({ isVersionSelectModalOpen: isOpen }),
  setSuccessModalOpen: (isOpen) => set({ isSuccessModalOpen: isOpen }),

  // 表单 actions
  setNewTitle: (title) => set({ newTitle: title }),
  setSavedTemplateId: (id) => set({ savedTemplateId: id }),
  setPendingSave: (state) => set({ pendingSave: state }),
  setPendingVersionSave: (state) => set({ pendingVersionSave: state }),

  // 新增清空消息的action
  clearMessages: () => set({ messages: [] }),

  // 复合 actions
  handleTitleConfirm: async () => {
    const state = get()
    const trimmedTitle = state.newTitle.trim()
    if (!trimmedTitle) {
      return
    }

    if (state.pendingSave) {
      try {
        await state.pendingSave.save(trimmedTitle)
        state.pendingSave.resolve()
      } catch (error) {
        state.pendingSave.reject(error)
        throw error
      } finally {
        set({
          pendingSave: null,
          isTitleModalOpen: false,
        })
      }
    }
  },

  handleTitleCancel: () => {
    const state = get()
    if (state.pendingSave) {
      state.pendingSave.reject(new Error("用户取消保存"))
      set({
        pendingSave: null,
        isTitleModalOpen: false,
      })
    }
  },

  handleVersionSelectConfirm: async (useCurrentVersion) => {
    const state = get()
    if (state.pendingVersionSave) {
      try {
        await state.pendingVersionSave.save(useCurrentVersion)
        state.pendingVersionSave.resolve()
        set({ isVersionSelectModalOpen: false })
      } catch (error) {
        state.pendingVersionSave.reject(error)
      } finally {
        set({ pendingVersionSave: null })
      }
    }
  },

  handleVersionSelectCancel: () => {
    const state = get()
    if (state.pendingVersionSave) {
      state.pendingVersionSave.reject(new Error("用户取消选择版本"))
      set({
        pendingVersionSave: null,
        isVersionSelectModalOpen: false,
      })
    }
  },
}))
