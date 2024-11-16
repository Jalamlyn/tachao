import { useCallback } from "react"
import { getMetadata, setMetadata } from "@/service/apis/api"
import { MetadataDetail } from "./types"
import { jsonParse, jsonStringify, logger } from "./utils"

/**
 * 元数据详情管理 Hook
 */
export function useMetadataDetail<T = any>(type: string) {
  /**
   * 获取详情数据
   * @param ids 元数据ID或ID数组
   * @returns 单个ID时返回单个详情对象或null,ID数组时返回详情对象数组
   */
  const getDetail = useCallback(
    async (ids: string | string[]) => {
      const idArray = Array.isArray(ids) ? ids : [ids]
      logger.debug("[useMetadataDetail] Getting details", { type, ids: idArray })

      try {
        const result = await getMetadata(idArray)
        
        // 处理返回结果
        const details = result.data
          .filter(item => item?.value) // 过滤掉无效数据
          .map(item => {
            const parsedData = jsonParse(item.value)
            return {
              ...parsedData,
              versionCode: item.versionCode,
            } as MetadataDetail<T>
          })

        logger.debug("[useMetadataDetail] Details loaded successfully", {
          requestedCount: idArray.length,
          loadedCount: details.length,
        })

        // 如果是单个ID请求,返回单个对象或null
        if (!Array.isArray(ids)) {
          return details[0] || null
        }

        // 如果是数组请求,返回详情数组
        return details
      } catch (error) {
        logger.error(`[useMetadataDetail] Error getting ${type} details`, error as Error, { ids: idArray })
        return Array.isArray(ids) ? [] : null
      }
    },
    [type]
  )

  /**
   * 保存详情
   */
  const saveDetail = useCallback(
    async (detail: MetadataDetail<T>) => {
      logger.debug("[useMetadataDetail] Saving detail", { type, id: detail.id })
      try {
        logger.debug("[useMetadataDetail] Detail", { detail })
        await setMetadata(`${detail.id}`, jsonStringify(detail))
        return true
      } catch (error) {
        logger.error(`[useMetadataDetail] Error saving ${type} detail`, error as Error, { id: detail.id })
        return false
      }
    },
    [type]
  )

  return {
    getDetail,
    saveDetail,
  }
}