import { useQuery } from '@tanstack/react-query'
import { getMetadata } from '@/service/apis/metadata'
import { AppIndex } from '../types'

export const useApps = () => {
  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const result = await getMetadata(['app_index'])
      return result.data?.[0]?.value ? JSON.parse(result.data[0].value) as AppIndex[] : []
    }
  })
}