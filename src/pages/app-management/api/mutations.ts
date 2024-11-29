import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setMetadata } from '@/service/apis/metadata'
import { CreateAppInput, AppIndex } from '../types'
import message from '@/components/Message'

export const useCreateApp = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: CreateAppInput) => {
      const newApp: AppIndex = {
        id: `app_${Date.now()}`,
        title: input.title,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const currentApps = await queryClient.getQueryData<AppIndex[]>(['apps']) || []
      const updatedApps = [...currentApps, newApp]
      
      await setMetadata('app_index', JSON.stringify(updatedApps))
      return newApp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] })
      message.success('应用创建成功')
    },
    onError: (error) => {
      console.error('Failed to create app:', error)
      message.error('创建应用失败')
    }
  })
}