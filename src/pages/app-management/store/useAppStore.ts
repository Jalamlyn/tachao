import { create } from 'zustand'
import { 
  QueryClient, 
  useQuery, 
  useMutation 
} from '@tanstack/react-query'
import { getMetadata, setMetadata } from '@/service/apis/metadata'
import message from '@/components/Message'

// 创建一个 QueryClient 实例
const queryClient = new QueryClient()

// 定义查询键
const QUERY_KEYS = {
  apps: ['apps'] as const,
}

// 类型定义
export interface AppIndex {
  id: string
  title: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateAppInput {
  title: string
  description?: string
}

// Store 类型定义
interface AppStore {
  // 状态
  isCreateModalOpen: boolean
  
  // UI Actions
  setCreateModalOpen: (isOpen: boolean) => void
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
}

export const useAppStore = create<AppStore>((set, get) => ({
  // 初始状态
  isCreateModalOpen: false,

  // UI Actions
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  reset: () => set({ isCreateModalOpen: false }),

  // Query Hooks
  useApps: () => {
    // 使用 react-query 的 useQuery
    const { data, isLoading, error, refetch } = useQuery({
      queryKey: QUERY_KEYS.apps,
      queryFn: async () => {
        const result = await getMetadata(['app_index'])
        return result.data?.[0]?.value 
          ? JSON.parse(result.data[0].value) as AppIndex[] 
          : []
      }
    })

    return {
      apps: data || [],
      isLoading,
      error: error as Error | null,
      refetch: async () => {
        await refetch()
      }
    }
  },

  // Mutation Hooks
  useCreateApp: () => {
    // 使用 react-query 的 useMutation
    const mutation = useMutation({
      mutationFn: async (input: CreateAppInput) => {
        const newApp: AppIndex = {
          id: `app_${Date.now()}`,
          title: input.title,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // 获取当前数据
        const currentData = queryClient.getQueryData<AppIndex[]>(QUERY_KEYS.apps) || []
        const updatedData = [...currentData, newApp]

        // 更新数据
        await setMetadata('app_index', JSON.stringify(updatedData))
        
        return newApp
      },
      onSuccess: () => {
        // 更新查询缓存
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.apps })
        // 关闭模态框
        get().setCreateModalOpen(false)
        message.success('应用创建成功')
      },
      onError: (error) => {
        console.error('Failed to create app:', error)
        message.error('创建应用失败')
      }
    })

    return {
      createApp: mutation.mutateAsync,
      isCreating: mutation.isPending,
      error: mutation.error as Error | null
    }
  }
}))