import { useState, useCallback } from "react"
import { deleteMetadata } from "@/service/apis/api"
import { getCurrentAccountInfo } from "@/service/apis/user"
import { MetadataDetail, MetadataIndex } from "./types"
import { generateMetadataId, logger } from "./utils"
import { useMetadataIndex } from "./useMetadataIndex"
import { useMetadataDetail } from "./useMetadataDetail"
import { useMetadataHistory } from "./useMetadataHistory"

interface UseMetadataOptions {
  public?: boolean
}

/**
 * 元数据管理 Hook
 */
export function useMetadata<T = any>(type: string, options: UseMetadataOptions = {}) {
  const [items, setItems] = useState<MetadataDetail<T>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { getIndexes, saveIndex } = useMetadataIndex(type)
  const { getDetail, saveDetail } = useMetadataDetail<T>(type, { public: options.public })
  const { getHistory } = useMetadataHistory(type)

  /**
   * 创建新项目
   */
  const create = useCallback(
    async (data: Partial<MetadataDetail<T>>) => {
      logger.debug("[useMetadata] Creating new item", { type })
      setLoading(true)
      setError(null)
      try {
        const currentUser = await getCurrentAccountInfo()
        const now = new Date().toISOString()

        // 生成规范化的ID
        const normalizedId = generateMetadataId(type, data.id)

        // 构建完整的详情数据
        const detail: MetadataDetail<T> = {
          id: normalizedId,
          type,
          title: data.title || "",
          status: data.status || "draft",
          data: data.data as T,
          versionCode: 1,
          modifiedBy: currentUser.name || currentUser.email || "Unknown",
          createdAt: now,
          updatedAt: now,
          template: data.template,
          indexFields: {
            ...(data.indexFields || {}),
            createdAt: now,
            updatedAt: now,
            templateId: data.template?.id,
            templateTitle: data.template?.title,
            templateType: data.template?.type,
          },
          ...data,
        }

        // 保存详情
        const detailSaved = await saveDetail(detail)
        if (!detailSaved) throw new Error("Failed to save detail")

        // 更新索引
        const indexes = await getIndexes()
        const newIndex: MetadataIndex = {
          id: normalizedId,
          type,
          title: detail.title,
          status: detail.status,
          updatedAt: now,
          template: detail.template,
          indexFields: detail.indexFields,
        }
        indexes.push(newIndex)
        const indexSaved = await saveIndex(indexes)
        if (!indexSaved) throw new Error("Failed to save index")

        setItems((prev) => [...prev, detail])
        logger.debug("[useMetadata] Item created successfully", { id: normalizedId })
        return detail
      } catch (error) {
        logger.error(`[useMetadata] Error creating ${type}`, error as Error)
        setError(`Failed to create ${type}`)
        return null
      } finally {
        setLoading(false)
      }
    },
    [type, saveDetail, saveIndex, getIndexes]
  )

  /**
   * 更新项目
   */
  const update = useCallback(
    async (id: string, data: Partial<MetadataDetail<T>>) => {
      logger.debug("[useMetadata] Updating item", { type, id })
      setLoading(true)
      setError(null)
      try {
        const currentDetail = await getDetail(id)
        if (!currentDetail) throw new Error("Item not found")

        const currentUser = await getCurrentAccountInfo()
        const now = new Date().toISOString()

        // 构建更新后的详情数据
        const updatedDetail: MetadataDetail<T> = {
          ...currentDetail,
          ...data,
          updatedAt: now,
          modifiedBy: currentUser.name || currentUser.email || "Unknown",
          template: data.template || currentDetail.template,
          indexFields: {
            ...(currentDetail.indexFields || {}),
            ...(data.indexFields || {}),
            updatedAt: now,
            templateId: (data.template || currentDetail.template)?.id,
            templateTitle: (data.template || currentDetail.template)?.title,
            templateType: (data.template || currentDetail.template)?.type,
          },
        }

        // 保存详情
        const detailSaved = await saveDetail(updatedDetail)
        if (!detailSaved) throw new Error("Failed to save detail")

        // 更新索引
        const indexes = await getIndexes()
        const index = indexes.findIndex((idx) => idx.id === id)
        if (index !== -1) {
          indexes[index] = {
            id,
            type,
            title: updatedDetail.title,
            status: updatedDetail.status,
            updatedAt: now,
            template: updatedDetail.template,
            indexFields: updatedDetail.indexFields,
          }
          const indexSaved = await saveIndex(indexes)
          if (!indexSaved) throw new Error("Failed to save index")
        }

        setItems((prev) => prev.map((item) => (item.id === id ? updatedDetail : item)))
        logger.debug("[useMetadata] Item updated successfully", { id })
        return updatedDetail
      } catch (error) {
        logger.error(`[useMetadata] Error updating ${type}`, error as Error, { id })
        setError(`Failed to update ${type}`)
        return null
      } finally {
        setLoading(false)
      }
    },
    [type, getDetail, saveDetail, getIndexes, saveIndex]
  )

  /**
   * 删除项目
   */
  const remove = useCallback(
    async (id: string) => {
      logger.debug("[useMetadata] Removing item", { type, id })
      setLoading(true)
      setError(null)
      try {
        // 删除详情
        await deleteMetadata({ name: `${id}` })

        // 更新索引
        const indexes = await getIndexes()
        const filteredIndexes = indexes.filter((idx) => idx.id !== id)
        await saveIndex(filteredIndexes)

        setItems((prev) => prev.filter((item) => item.id !== id))
        logger.debug("[useMetadata] Item removed successfully", { id })
        return true
      } catch (error) {
        logger.error(`[useMetadata] Error deleting ${type}`, error as Error, { id })
        setError(`Failed to delete ${type}`)
        return false
      } finally {
        setLoading(false)
      }
    },
    [type, getIndexes, saveIndex]
  )

  /**
   * 加载列表
   */
  const load = useCallback(async () => {
    logger.debug("[useMetadata] Loading list", { type })
    setLoading(true)
    setError(null)
    try {
      const indexes = await getIndexes()
      const simpleDetails = indexes.map((index) => ({
        id: index.id,
        type: index.type,
        title: index.title,
        status: index.status,
        updatedAt: index.updatedAt,
        template: index.template,
        indexFields: index.indexFields,
        data: {} as T,
        versionCode: 0,
        modifiedBy: "",
        createdAt: index.indexFields?.createdAt || index.updatedAt,
      }))
      setItems(simpleDetails)
      logger.debug("[useMetadata] List loaded successfully", {
        count: simpleDetails.length,
      })
      return simpleDetails
    } catch (error) {
      logger.error(`[useMetadata] Error loading ${type} list`, error as Error)
      setError(`Failed to load ${type} list`)
      return []
    } finally {
      setLoading(false)
    }
  }, [type, getIndexes])

  /**
   * 加载列表(包含详情)
   */
  const loadWithDetails = useCallback(async () => {
    logger.debug("[useMetadata] Loading list with details", { type })
    setLoading(true)
    setError(null)
    try {
      const indexes = await getIndexes()
      const details = await Promise.all(indexes.map((index) => getDetail(index.id)))
      const validDetails = details.filter((d): d is MetadataDetail<T> => d !== null)
      setItems(validDetails)
      logger.debug("[useMetadata] List with details loaded successfully", {
        count: validDetails.length,
      })
      return validDetails
    } catch (error) {
      logger.error(`[useMetadata] Error loading ${type} list with details`, error as Error)
      setError(`Failed to load ${type} list with details`)
      return []
    } finally {
      setLoading(false)
    }
  }, [type, getIndexes, getDetail])

  /**
   * 根据索引字段筛选并加载详情
   * @param filter 筛选函数,用于过滤索引
   */
  const loadFilteredDetails = useCallback(
    async (filter: (index: MetadataIndex) => boolean) => {
      logger.debug("[useMetadata] Loading filtered details", { type })
      setLoading(true)
      setError(null)
      try {
        // 1. 获取并筛选索引
        const indexes = await getIndexes()
        const filteredIndexes = indexes.filter(filter)
        logger.debug("[useMetadata] Filtered indexes", { 
          totalCount: indexes.length,
          filteredCount: filteredIndexes.length 
        })

        // 2. 一次性获取所有匹配的详情
        const ids = filteredIndexes.map(index => index.id)
        const details = await getDetail(ids)
        const validDetails = Array.isArray(details) ? details : []
        
        // 3. 更新状态
        setItems(validDetails)
        logger.debug("[useMetadata] Filtered details loaded successfully", {
          count: validDetails.length,
        })
        
        return validDetails
      } catch (error) {
        logger.error(`[useMetadata] Error loading filtered ${type} details`, error as Error)
        setError(`Failed to load filtered ${type} details`)
        return []
      } finally {
        setLoading(false)
      }
    },
    [type, getIndexes, getDetail]
  )

  return {
    items,
    loading,
    error,
    load,
    loadWithDetails,
    loadFilteredDetails,
    create,
    update,
    remove,
    getDetail,
    getHistory,
  }
}

// 导出所有类型和工具函数
export * from "./types"
export * from "./utils"
export * from "./useMetadataIndex"
export * from "./useMetadataDetail"
export * from "./useMetadataHistory"