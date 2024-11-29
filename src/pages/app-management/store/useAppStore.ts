import { create } from "zustand"
import { QueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import message from "@/components/Message"

// 创建一个 QueryClient 实例
const queryClient = new QueryClient()

// 定义查询键
const QUERY_KEYS = {
  apps: ["apps"] as const,
}

// 类型定义
export interface AppIndex {
  id: string
  title: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  indexFields?: {
    templateIds: string[]
    reportIds: string[]
  }
}

export interface CreateAppInput {
  title: string
  description?: string
}

export interface UpdateAppConfigInput {
  templateIds: string[]
  reportIds: string[]
}

// Store 类型定义
interface AppStore {
  // 状态
  isCreateModalOpen: boolean
  isDevelopModalOpen: boolean
  selectedApp: AppIndex | null

  // UI Actions
  setCreateModalOpen: (isOpen: boolean) => void
  setDevelopModalOpen: (isOpen: boolean) => void
  setSelectedApp: (app: AppIndex | null) => void
  reset: () => void

  // Query Hooks
  useApps: () => {
    apps: AppIndex[]
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<void>
  }

  // Mutation Hooks
  useCreateApp: () => {
    createApp: (input: CreateAppInput) => Promise<void>
    isCreating: boolean
    error: Error | null
  }

  useUpdateAppConfig: () => {
    updateAppConfig: (appId: string, input: UpdateAppConfigInput) => Promise<void>
    isUpdating: boolean
    error: Error | null
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  // 初始状态
  isCreateModalOpen: false,
  isDevelopModalOpen: false,
  selectedApp: null,

  // UI Actions
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  setDevelopModalOpen: (isOpen) => set({ isDevelopModalOpen: isOpen }),
  setSelectedApp: (app) => set({ selectedApp: app }),
  reset: () =>
    set({
      isCreateModalOpen: false,
      isDevelopModalOpen: false,
      selectedApp: null,
    }),

  // Query Hooks
  useApps: () => {
    const { data, isLoading, error, refetch } = useQuery({
      queryKey: QUERY_KEYS.apps,
      queryFn: async () => {
        const result = await getMetadata(["app_index"])
        return result.data?.[0]?.value ? (JSON.parse(result.data[0].value) as AppIndex[]) : []
      },
    })

    return {
      apps: data || [],
      isLoading,
      error: error as Error | null,
      refetch: async () => {
        await refetch()
      },
    }
  },

  // Mutation Hooks
  useCreateApp: () => {
    const mutation = useMutation({
      mutationFn: async (input: CreateAppInput) => {
        const newApp: AppIndex = {
          id: `app_${Date.now()}`,
          title: input.title,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          indexFields: {
            templateIds: [],
            reportIds: [],
          },
        }

        // 获取当前数据
        const result = await getMetadata(["app_index"])
        const currentData = result.data?.[0]?.value ? JSON.parse(result.data[0].value) as AppIndex[] : []
        const updatedData = [...currentData, newApp]

        // 更新数据
        await setMetadata("app_index", JSON.stringify(updatedData))

        return newApp
      },
      onSuccess: () => {
        // 更新查询缓存
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
        // 关闭模态框
        get().setCreateModalOpen(false)
        message.success("应用创建成功")
      },
      onError: (error) => {
        console.error("Failed to create app:", error)
        message.error("创建应用失败")
      },
    })

    return {
      createApp: mutation.mutateAsync,
      isCreating: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },

  useUpdateAppConfig: () => {
    const mutation = useMutation({
      mutationFn: async ({ appId, input }: { appId: string; input: UpdateAppConfigInput }) => {
        try {
          // 从服务器获取最新数据
          const result = await getMetadata(["app_index"])
          if (!result.data?.[0]?.value) {
            throw new Error("无法获取应用数据")
          }

          const currentData = JSON.parse(result.data[0].value) as AppIndex[]
          if (!Array.isArray(currentData) || currentData.length === 0) {
            throw new Error("应用数据格式错误")
          }

          const targetApp = currentData.find(app => app.id === appId)
          if (!targetApp) {
            throw new Error("未找到目标应用")
          }

          const updatedData = currentData.map((app) => {
            if (app.id === appId) {
              return {
                ...app,
                indexFields: {
                  ...app.indexFields,
                  templateIds: input.templateIds,
                  reportIds: input.reportIds,
                },
                updatedAt: new Date().toISOString(),
              }
            }
            return app
          })

          // 更新数据
          await setMetadata("app_index", JSON.stringify(updatedData))

          // 验证更新后的数据
          const verifyResult = await getMetadata(["app_index"])
          const verifyData = JSON.parse(verifyResult.data[0].value) as AppIndex[]
          const verifyApp = verifyData.find(app => app.id === appId)
          
          if (!verifyApp || 
              !verifyApp.indexFields || 
              !Array.isArray(verifyApp.indexFields.templateIds) || 
              !Array.isArray(verifyApp.indexFields.reportIds)) {
            throw new Error("数据更新验证失败")
          }

        } catch (error) {
          console.error("Error updating app config:", error)
          throw new Error(error instanceof Error ? error.message : "更新应用配置失败")
        }
      },
      onSuccess: () => {
        // 更新查询缓存
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
        // 关闭模态框
        get().setDevelopModalOpen(false)
        get().setSelectedApp(null)
        message.success("应用配置更新成功")
      },
      onError: (error) => {
        console.error("Failed to update app config:", error)
        message.error(error instanceof Error ? error.message : "更新应用配置失败")
      },
    })

    return {
      updateAppConfig: mutation.mutateAsync,
      isUpdating: mutation.isPending,
      error: mutation.error as Error | null,
    }
  },
}))