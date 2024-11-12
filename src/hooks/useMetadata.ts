import { useState, useCallback } from "react"
import { setMetadata, getMetadata, queryMetadataHistory, deleteMetadata } from "@/service/apis/api"
import { getCurrentAccountInfo } from "@/service/apis/user"
import { jsonParse, jsonStringify } from "@/utils"
import { logger } from "@/utils/logger"

/**
 * 元数据索引接口
 */
export interface MetadataIndex {
  id: string
  type: string // 'form' | 'template' | 'resource' 等
  title: string
  status: string
  updatedAt: string
  // 新增: 模板相关字段
  template?: {
    id: string
    title: string
    type: string
  }
  // 新增: 索引字段
  indexFields?: {
    templateId?: string
    templateTitle?: string
    templateType?: string
    orderNumber?: string
    createdAt: string
    updatedAt?: string
    [key: string]: any
  }
  [key: string]: any // 支持扩展字段
}

/**
 * 元数据详情接口
 */
export interface MetadataDetail<T = any> {
  id: string
  type: string
  title: string
  status: string
  data: T
  versionCode: number
  modifiedBy: string
  createdAt: string
  updatedAt: string
  template?: {
    id: string
    title: string
    type: string
  }
  indexFields?: {
    templateId?: string
    templateTitle?: string
    templateType?: string
    orderNumber?: string
    createdAt: string
    updatedAt?: string
    [key: string]: any
  }
  [key: string]: any
}

/**
 * 生成规范化的元数据ID
 */
const generateMetadataId = (type: string, customId?: string): string => {
  if (customId) {
    const cleanId = customId.replace(new RegExp(`^${type}_`), "")
    return `${type}_${cleanId}`
  }
  return `${type}_${Date.now()}`
}

/**
 * 元数据管理 Hook
 */
export function useMetadata<T = any>(type: string) {
  const [items, setItems] = useState<MetadataDetail<T>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取索引列表
   */
  const getIndexes = useCallback(async () => {
    logger.debug("[useMetadata] Getting indexes", { type })
    try {
      const result = await getMetadata([`${type}_index`])
      if (result.data?.[0]?.value) {
        const indexes = jsonParse(result.data[0].value) as MetadataIndex[]
        logger.debug("[useMetadata] Indexes loaded successfully", {
          count: indexes.length,
        })
        return indexes
      }
      logger.debug("[useMetadata] No indexes found")
      return []
    } catch (error) {
      logger.error(`[useMetadata] Error getting ${type} indexes`, error as Error)
      setError(`Failed to get ${type} indexes`)
      return []
    }
  }, [type])

  /**
   * 获取详情数据
   */
  const getDetail = useCallback(
    async (id: string) => {
      logger.debug("[useMetadata] Getting detail", { type, id })
      try {
        const result = await getMetadata([`${id}`])
        if (result.data?.[0]?.value) {
          const parsedData = jsonParse(result.data[0].value)
          return {
            ...parsedData,
            versionCode: result.data[0].versionCode,
          } as MetadataDetail<T>
        }
        logger.debug("[useMetadata] No detail found", { id })
        return null
      } catch (error) {
        logger.error(`[useMetadata] Error getting ${type} detail`, error as Error, { id })
        setError(`Failed to get ${type} detail`)
        return null
      }
    },
    [type]
  )

  /**
   * 保存索引
   */
  const saveIndex = useCallback(
    async (indexes: MetadataIndex[]) => {
      logger.debug("[useMetadata] Saving indexes", { type, count: indexes.length })
      try {
        await setMetadata(`${type}_index`, jsonStringify(indexes))
        logger.debug("[useMetadata] Indexes saved successfully")
        return true
      } catch (error) {
        logger.error(`[useMetadata] Error saving ${type} index`, error as Error)
        setError(`Failed to save ${type} index`)
        return false
      }
    },
    [type]
  )

  /**
   * 保存详情
   */
  const saveDetail = useCallback(
    async (detail: MetadataDetail<T>) => {
      logger.debug("[useMetadata] Saving detail", { type, id: detail.id })
      try {
        // 转换函数为字符串
        logger.debug("[useMetadata] Detail", { detail })
        await setMetadata(`${detail.id}`, jsonStringify(detail))
        return true
      } catch (error) {
        logger.error(`[useMetadata] Error saving ${type} detail`, error as Error, { id: detail.id })
        setError(`Failed to save ${type} detail`)
        return false
      }
    },
    [type]
  )

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
   * 获取历史记录
   */
  const getHistory = useCallback(
    async (id: string) => {
      logger.debug("[useMetadata] Getting history", { type, id })
      setLoading(true)
      setError(null)
      try {
        const history = await queryMetadataHistory({ names: [`${id}`] })
        const formattedHistory = history.data.map((item) => ({
          updatedAt: item.updatedAt,
          versionCode: item.versionCode,
          modifiedBy: jsonParse(item.value).modifiedBy || "Unknown",
          value: item.value,
        }))
        logger.debug("[useMetadata] History loaded successfully", {
          id,
          count: formattedHistory.length,
        })
        return formattedHistory
      } catch (error) {
        logger.error(`[useMetadata] Error getting ${type} history`, error as Error, { id })
        setError(`Failed to get ${type} history`)
        return []
      } finally {
        setLoading(false)
      }
    },
    [type]
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

  return {
    items,
    loading,
    error,
    load,
    loadWithDetails,
    create,
    update,
    remove,
    getDetail,
    getHistory,
  }
}
