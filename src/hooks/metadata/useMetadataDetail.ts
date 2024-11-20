import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMetadata, setMetadata, getPublicMetaData } from "@/service/apis/api"
import { MetadataDetail } from "./types"
import { jsonParse, jsonStringify, logger } from "./utils"

interface UseMetadataDetailOptions {
  public?: boolean
}

/**
 * 元数据详情管理 Hook (传统实现)
 */
export function useMetadataDetail<T = any>(type: string, options: UseMetadataDetailOptions = {}) {
  /**
   * 获取详情数据
   * @param ids 元数据ID或ID数组
   * @returns 单个ID时返回单个详情对象或null,ID数组时返回详情对象数组
   */
  const getDetail = useCallback(
    async (ids: string | string[]) => {
      const idArray = Array.isArray(ids) ? ids : [ids]
      logger.debug("[useMetadataDetail] Getting details", {
        type,
        ids: idArray,
        isPublic: options.public,
      })

      try {
        // 根据options.public选择使用哪个接口
        const result = options.public ? await getPublicMetaData(idArray) : await getMetadata(idArray)

        // 处理返回结果
        const details = result.data
          .filter((item) => item?.value) // 过滤掉无效数据
          .map((item) => {
            const parsedData = jsonParse(item.value)
            return {
              ...parsedData,
              versionCode: item.versionCode,
            } as MetadataDetail<T>
          })

        logger.debug("[useMetadataDetail] Details loaded successfully", {
          requestedCount: idArray.length,
          loadedCount: details.length,
          isPublic: options.public,
        })

        // 如果是单个ID请求,返回单个对象或null
        if (!Array.isArray(ids)) {
          return details[0] || null
        }

        // 如果是数组请求,返回详情数组
        return details
      } catch (error) {
        logger.error(`[useMetadataDetail] Error getting ${type} details`, error as Error, {
          ids: idArray,
          isPublic: options.public,
        })
        return Array.isArray(ids) ? [] : null
      }
    },
    [type, options.public]
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
