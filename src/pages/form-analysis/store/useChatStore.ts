import { create } from "zustand"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"

// 类型定义
export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  selectedTemplates: string[]
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface CreateSessionInput {
  title: string
  selectedTemplates: string[]
}

// Store 类型定义
interface ChatStore {
  // UI 状态
  isTemplateModalOpen: boolean
  isSidebarOpen: boolean
  currentSession: ChatSession | null
  
  // UI Actions
  setTemplateModalOpen: (isOpen: boolean) => void
  setSidebarOpen: (isOpen: boolean) => void
  setCurrentSession: (session: ChatSession | null) => void
  
  // Query Hooks
  useSessions: () => {
    sessions: ChatSession[]
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<void>
  }
  
  // Mutation Hooks
  useCreateSession: () => {
    createSession: (input: CreateSessionInput) => Promise<void>
    isCreating: boolean
    error: Error | null
  }
  
  useUpdateSession: () => {
    updateSession: (sessionId: string, message: ChatMessage) => Promise<void>
    isUpdating: boolean
    error: Error | null
  }
  
  useDeleteSession: () => {
    deleteSession: (sessionId: string) => Promise<void>
    isDeleting: boolean
    error: Error | null
  }
}

// 定义查询键
const QUERY_KEYS = {
  sessions: ["chat_sessions"] as const,
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // 初始状态
  isTemplateModalOpen: false,
  isSidebarOpen: true,
  currentSession: null,

  // UI Actions
  setTemplateModalOpen: (isOpen) => set({ isTemplateModalOpen: isOpen }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setCurrentSession: (session) => set({ currentSession: session }),

  // Query Hooks
  useSessions: () => {
    const query = useQuery({
      queryKey: QUERY_KEYS.sessions,
      queryFn: async () => {
        const result = await getMetadata(["chat_sessions"])
        if (result.data?.[0]?.value) {
          return JSON.parse(result.data[0].value) as ChatSession[]
        }
        return []
      },
    })

    return {
      sessions: query.data || [],
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refetch: async () => {
        await query.refetch()
      },
    }
  },

  // Mutation Hooks
  useCreateSession: () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
      mutationFn: async (input: CreateSessionInput) => {
        const newSession: ChatSession = {
          id: `chat_${Date.now()}`,
          title: input.title,
          selectedTemplates: input.selectedTemplates,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        }

        // 获取当前会话列表
        const result = await getMetadata(["chat_sessions"])
        const currentSessions = result.data?.[0]?.value 
          ? JSON.parse(result.data[0].value) as ChatSession[]
          : []

        // 乐观更新
        queryClient.setQueryData(QUERY_KEYS.sessions, [...currentSessions, newSession])

        try {
          // 保存到服务器
          await setMetadata(
            "chat_sessions",
            JSON.stringify([...currentSessions, newSession])
          )

          // 设置为当前会话
          get().setCurrentSession(newSession)
          get().setTemplateModalOpen(false)
        } catch (error) {
          // 回滚缓存
          queryClient.setQueryData(QUERY_KEYS.sessions, currentSessions)
          throw error
        }
      },
      onError: (error) => {
        console.error("Failed to create session:", error)
        message.error("创建会话失败")
      },
    })

    return {
      createSession: mutation.mutateAsync,
      isCreating: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },

  useUpdateSession: () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
      mutationFn: async ({
        sessionId,
        message: chatMessage,
      }: {
        sessionId: string
        message: ChatMessage
      }) => {
        // 获取当前会话列表
        const result = await getMetadata(["chat_sessions"])
        const sessions = result.data?.[0]?.value 
          ? JSON.parse(result.data[0].value) as ChatSession[]
          : []

        // 更新指定会话
        const updatedSessions = sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, chatMessage],
                updatedAt: new Date().toISOString(),
              }
            : session
        )

        // 乐观更新
        queryClient.setQueryData(QUERY_KEYS.sessions, updatedSessions)

        try {
          // 保存到服务器
          await setMetadata("chat_sessions", JSON.stringify(updatedSessions))
        } catch (error) {
          // 回滚缓存
          queryClient.setQueryData(QUERY_KEYS.sessions, sessions)
          throw error
        }
      },
      onError: (error) => {
        console.error("Failed to update session:", error)
        message.error("更新会话失败")
      },
    })

    return {
      updateSession: mutation.mutateAsync,
      isUpdating: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },

  useDeleteSession: () => {
    const queryClient = useQueryClient()
    const mutation = useMutation({
      mutationFn: async (sessionId: string) => {
        // 获取当前会话列表
        const result = await getMetadata(["chat_sessions"])
        const sessions = result.data?.[0]?.value 
          ? JSON.parse(result.data[0].value) as ChatSession[]
          : []

        // 过滤掉要删除的会话
        const updatedSessions = sessions.filter(
          (session) => session.id !== sessionId
        )

        // 乐观更新
        queryClient.setQueryData(QUERY_KEYS.sessions, updatedSessions)

        try {
          // 保存到服务器
          await setMetadata("chat_sessions", JSON.stringify(updatedSessions))

          // 如果删除的是当前会话，清空当前会话
          if (get().currentSession?.id === sessionId) {
            get().setCurrentSession(null)
          }
        } catch (error) {
          // 回滚缓存
          queryClient.setQueryData(QUERY_KEYS.sessions, sessions)
          throw error
        }
      },
      onError: (error) => {
        console.error("Failed to delete session:", error)
        message.error("删除会话失败")
      },
    })

    return {
      deleteSession: mutation.mutateAsync,
      isDeleting: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },
}))