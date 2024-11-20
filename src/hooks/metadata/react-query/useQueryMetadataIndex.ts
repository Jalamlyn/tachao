import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMetadata, setMetadata } from "@/service/apis/api"
import { MetadataIndex } from "../types"
import { jsonParse, jsonStringify, logger } from "../utils"
import { QueryMetadataOptions, QueryMetadataIndexResult } from "./types"

/**
 * 使用 React Query 重写的元数据索引管理 Hook
 */
export function useQueryMetadataIndex(
  type: string,
  options: QueryMetadataOptions = {}
): QueryMetadataIndexResult & {
  saveIndex: (indexes: MetadataIndex[]) => Promise<boolean>
} {
  const queryClient = useQueryClient()
  const queryKey = [`metadata-index-${type}`]

  // 查询 Hook
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      logger.debug("[useQueryMetadataIndex] Getting indexes", { type })
      try {
        const result = await getMetadata([`${type}_index`])
        if (result.data?.[0]?.value) {
          const indexes = jsonParse(result.data[0].value) as MetadataIndex[]
          logger.debug("[useQueryMetadataIndex] Indexes loaded successfully", {
            count: indexes.length,
          })
          return indexes
        }
        logger.debug("[useQueryMetadataIndex] No indexes found")
        return []
      } catch (error) {
        logger.error(`[useQueryMetadataIndex] Error getting ${type} indexes`, error as Error)
        throw error
      }
    },
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 默认5分钟
    cacheTime: options.cacheTime ?? 30 * 60 * 1000, // 默认30分钟
    suspense: options.suspense,
  })

  // 修改 Hook
  const mutation = useMutation({
    mutationFn: async (indexes: MetadataIndex[]) => {
      logger.debug("[useQueryMetadataIndex] Saving indexes", { type, count: indexes.length })
      try {
        await setMetadata(`${type}_index`, jsonStringify(indexes))
        logger.debug("[useQueryMetadataIndex] Indexes saved successfully")
        return true
      } catch (error) {
        logger.error(`[useQueryMetadataIndex] Error saving ${type} index`, error as Error)
        return false
      }
    },
    onSuccess: () => {
      // 更新查询缓存
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    saveIndex: mutation.mutateAsync,
  }
}