import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTransition } from "react"
import { getMetadata, setMetadata, getPublicMetaData } from "@/service/apis/api"
import { MetadataDetail } from "../metadata/types"
import { jsonParse, jsonStringify, logger } from "../metadata/utils"
import { QueryMetadataOptions, QueryMetadataDetailResult } from "./types"

/**
 * 使用 React Query 重写的元数据详情管理 Hook
 */
export function useQueryMetadataDetail<T = any>(
  type: string,
  id: string | string[],
  options: QueryMetadataOptions = {}
): QueryMetadataDetailResult<T> & {
  saveDetail: (detail: MetadataDetail<T>) => Promise<boolean>
} {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const queryKey = [`metadata-detail-${type}`, id]
  const idArray = Array.isArray(id) ? id : [id]

  // 查询 Hook
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      logger.debug("[useQueryMetadataDetail] Getting details", {
        type,
        ids: idArray,
        isPublic: options.public,
      })

      try {
        const result = options.public ? await getPublicMetaData(idArray) : await getMetadata(idArray)

        const details = result.data
          .filter((item) => item?.value)
          .map((item) => {
            const parsedData = jsonParse(item.value)
            return {
              ...parsedData,
              versionCode: item.versionCode,
            } as MetadataDetail<T>
          })

        logger.debug("[useQueryMetadataDetail] Details loaded successfully", {
          requestedCount: idArray.length,
          loadedCount: details.length,
          isPublic: options.public,
        })

        return Array.isArray(id) ? details : details[0] || null
      } catch (error) {
        logger.error(`[useQueryMetadataDetail] Error getting ${type} details`, error as Error, {
          ids: idArray,
          isPublic: options.public,
        })
        throw error
      }
    },
    staleTime: options.staleTime ?? 5 * 1000,
    cacheTime: options.cacheTime ?? 30 * 1000,
    suspense: options.suspense ?? false,
  })

  // 修改 Hook
  const mutation = useMutation({
    mutationFn: async (detail: MetadataDetail<T>) => {
      logger.debug("[useQueryMetadataDetail] Saving detail", { type, id: detail.id })
      try {
        await setMetadata(`${detail.id}`, jsonStringify(detail))
        return true
      } catch (error) {
        logger.error(`[useQueryMetadataDetail] Error saving ${type} detail`, error as Error, { id: detail.id })
        return false
      }
    },
    onSuccess: () => {
      startTransition(() => {
        // 更新查询缓存
        queryClient.invalidateQueries({ queryKey })
      })
    },
  })

  return {
    data: query.data as MetadataDetail<T> | null,
    isLoading: query.isLoading,
    isPending,
    error: query.error as Error | null,
    refetch: query.refetch,
    saveDetail: mutation.mutateAsync,
  }
}