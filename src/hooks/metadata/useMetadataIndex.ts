import { useCallback } from "react"
import { getMetadata, setMetadata } from "@/service/apis/api"
import { MetadataIndex } from "./types"
import { jsonParse, jsonStringify, logger } from "./utils"

/**
 * 元数据索引管理 Hook
 */
export function useMetadataIndex(type: string) {
  /**
   * 获取索引列表
   */
  const getIndexes = useCallback(async () => {
    logger.debug("[useMetadataIndex] Getting indexes", { type })
    try {
      const result = await getMetadata([`${type}_index`])
      if (result.data?.[0]?.value) {
        const indexes = jsonParse(result.data[0].value) as MetadataIndex[]
        logger.debug("[useMetadataIndex] Indexes loaded successfully", {
          count: indexes.length,
        })
        return indexes
      }
      logger.debug("[useMetadataIndex] No indexes found")
      return []
    } catch (error) {
      logger.error(`[useMetadataIndex] Error getting ${type} indexes`, error as Error)
      return []
    }
  }, [type])

  /**
   * 保存索引
   */
  const saveIndex = useCallback(
    async (indexes: MetadataIndex[]) => {
      logger.debug("[useMetadataIndex] Saving indexes", { type, count: indexes.length })
      try {
        await setMetadata(`${type}_index`, jsonStringify(indexes))
        logger.debug("[useMetadataIndex] Indexes saved successfully")
        return true
      } catch (error) {
        logger.error(`[useMetadataIndex] Error saving ${type} index`, error as Error)
        return false
      }
    },
    [type]
  )

  return {
    getIndexes,
    saveIndex,
  }
}