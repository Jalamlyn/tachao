import { useCallback } from "react"
import { queryMetadataHistory } from "@/service/apis/api"
import { jsonParse, logger } from "./utils"

/**
 * 元数据历史记录管理 Hook
 */
export function useMetadataHistory(type: string) {
  /**
   * 获取历史记录
   */
  const getHistory = useCallback(
    async (id: string) => {
      logger.debug("[useMetadataHistory] Getting history", { type, id })
      try {
        const history = await queryMetadataHistory({ names: [`${id}`] })
        const formattedHistory = history.data.map((item) => ({
          updatedAt: item.updatedAt,
          versionCode: item.versionCode,
          modifiedBy: jsonParse(item.value).modifiedBy || "Unknown",
          value: item.value,
        }))
        logger.debug("[useMetadataHistory] History loaded successfully", {
          id,
          count: formattedHistory.length,
        })
        return formattedHistory
      } catch (error) {
        logger.error(`[useMetadataHistory] Error getting ${type} history`, error as Error, { id })
        return []
      }
    },
    [type]
  )

  return {
    getHistory,
  }
}