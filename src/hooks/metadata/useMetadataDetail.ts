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
        isPublic: options.public 
      })

      try {
        // 根据options.public选择使用哪个接口
        const result = options.public 
          ? await getPublicMetaData(idArray)
          : await getMetadata(idArray)
        
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
          isPublic: options.public
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
          isPublic: options.public 
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

/**
 * 使用 React Query 的元数据详情管理 Hook
 */
export function useQueryMetadataDetail<T = any>(
  type: string,
  id: string | string[],
  options: UseMetadataDetailOptions = {}
) {
  const queryClient = useQueryClient()
  const idArray = Array.isArray(id) ? id : [id]

  // 查询 hook
  const query = useQuery({
    queryKey: ['metadata', type, idArray, options.public],
    queryFn: async () => {
      const result = options.public 
        ? await getPublicMetaData(idArray)
        : await getMetadata(idArray)
      
      const details = result.data
        .filter(item => item?.value)
        .map(item => ({
          ...jsonParse(item.value),
          versionCode: item.versionCode,
        } as MetadataDetail<T>))

      return Array.isArray(id) ? details : details[0] || null
    },
    suspense: false, // 启用 Suspense 模式
  })

  // 修改 hook
  const mutation = useMutation({
    mutationFn: async (detail: MetadataDetail<T>) => {
      await setMetadata(`${detail.id}`, jsonStringify(detail))
      return detail
    },
    onSuccess: (detail) => {
      // 更新查询缓存
      queryClient.setQueryData(
        ['metadata', type, Array.isArray(id) ? id : [id], options.public],
        Array.isArray(id) ? (old: MetadataDetail<T>[]) => {
          return old.map(item => item.id === detail.id ? detail : item)
        } : detail
      )
    }
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    save: mutation.mutate,
    isSaving: mutation.isPending
  }
}