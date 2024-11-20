import { useQuery } from "@tanstack/react-query"
import { queryMetadataHistory } from "@/service/apis/api"
import { jsonParse, logger } from "../utils"
import { QueryMetadataOptions, QueryMetadataHistoryResult } from "./types"

/**
 * 使用 React Query 重写的元数据历史记录管理 Hook
 */
export function useQueryMetadataHistory(
  type: string,
  id: string,
  options: QueryMetadataOptions = {}
): QueryMetadataHistoryResult {
  const queryKey = [`metadata-history-${type}`, id]

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      logger.debug("[useQueryMetadataHistory] Getting history", { type, id })
      try {
        const history = await queryMetadataHistory({ names: [`${id}`] })
        const formattedHistory = history.data.map((item) => ({
          updatedAt: item.updatedAt,
          versionCode: item.versionCode,
          modifiedBy: jsonParse(item.value).modifiedBy || "Unknown",
          value: item.value,
        }))
        logger.debug("[useQueryMetadataHistory] History loaded successfully", {
          id,
          count: formattedHistory.length,
        })
        return formattedHistory
      } catch (error) {
        logger.error(`[useQueryMetadataHistory] Error getting ${type} history`, error as Error, { id })
        throw error
      }
    },
    staleTime: options.staleTime ?? 5 * 1000,
    cacheTime: options.cacheTime ?? 30 * 1000,
    suspense: options.suspense ?? false,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
