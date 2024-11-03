import { useState, useCallback } from "react"
import { setMetadata, getMetadata, queryMetadataHistory, deleteMetadata } from "@/service/apis/api"
import { getCurrentAccountInfo } from "@/service/apis/user"
import { jsonParse, jsonStringify } from "@/utils"

/**
 * 元数据索引接口
 */
export interface MetadataIndex {
  id: string
  type: string // 'form' | 'template' | 'resource' 等
  title: string
  status: string
  updatedAt: string
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
  [key: string]: any
}

/**
 * 元数据管理 Hook
 * @param type 数据类型
 * @returns 元数据操作方法集合
 */
export function useMetadata<T = any>(type: string) {
  const [items, setItems] = useState<MetadataDetail<T>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取索引列表
   */
  const getIndexes = useCallback(async () => {
    try {
      const result = await getMetadata([`${type}_index`])
      if (result.data?.[0]?.value) {
        return jsonParse(result.data[0].value) as MetadataIndex[]
      }
      return []
    } catch (error) {
      console.error(`Error getting ${type} indexes:`, error)
      setError(`Failed to get ${type} indexes`)
      return []
    }
  }, [type])

  /**
   * 获取详情数据
   */
  const getDetail = useCallback(async (id: string) => {
    try {
      const result = await getMetadata([`${type}_${id}`])
      if (result.data?.[0]?.value) {
        return {
          ...jsonParse(result.data[0].value),
          versionCode: result.data[0].versionCode
        } as MetadataDetail<T>
      }
      return null
    } catch (error) {
      console.error(`Error getting ${type} detail:`, error)
      setError(`Failed to get ${type} detail`)
      return null
    }
  }, [type])

  /**
   * 保存索引
   */
  const saveIndex = useCallback(async (indexes: MetadataIndex[]) => {
    try {
      await setMetadata(`${type}_index`, jsonStringify(indexes))
      return true
    } catch (error) {
      console.error(`Error saving ${type} index:`, error)
      setError(`Failed to save ${type} index`)
      return false
    }
  }, [type])

  /**
   * 保存详情
   */
  const saveDetail = useCallback(async (detail: MetadataDetail<T>) => {
    try {
      await setMetadata(`${type}_${detail.id}`, jsonStringify(detail))
      return true
    } catch (error) {
      console.error(`Error saving ${type} detail:`, error)
      setError(`Failed to save ${type} detail`)
      return false
    }
  }, [type])

  /**
   * 创建新项目
   */
  const create = useCallback(async (data: Partial<MetadataDetail<T>>) => {
    setLoading(true)
    setError(null)
    try {
      const currentUser = await getCurrentAccountInfo()
      const now = new Date().toISOString()
      
      // 构建完整的详情数据
      const detail: MetadataDetail<T> = {
        id: data.id || `${type}_${Date.now()}`,
        type,
        title: data.title || '',
        status: data.status || 'draft',
        data: data.data as T,
        versionCode: 1,
        modifiedBy: currentUser.name || currentUser.email || 'Unknown',
        createdAt: now,
        updatedAt: now,
        ...data
      }

      // 保存详情
      const detailSaved = await saveDetail(detail)
      if (!detailSaved) throw new Error('Failed to save detail')

      // 更新索引
      const indexes = await getIndexes()
      const newIndex: MetadataIndex = {
        id: detail.id,
        type,
        title: detail.title,
        status: detail.status,
        updatedAt: now
      }
      indexes.push(newIndex)
      const indexSaved = await saveIndex(indexes)
      if (!indexSaved) throw new Error('Failed to save index')

      setItems(prev => [...prev, detail])
      return detail
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      setError(`Failed to create ${type}`)
      return null
    } finally {
      setLoading(false)
    }
  }, [type, saveDetail, saveIndex, getIndexes])

  /**
   * 更新项目
   */
  const update = useCallback(async (id: string, data: Partial<MetadataDetail<T>>) => {
    setLoading(true)
    setError(null)
    try {
      const currentDetail = await getDetail(id)
      if (!currentDetail) throw new Error('Item not found')

      const currentUser = await getCurrentAccountInfo()
      const now = new Date().toISOString()

      // 构建更新后的详情数据
      const updatedDetail: MetadataDetail<T> = {
        ...currentDetail,
        ...data,
        updatedAt: now,
        modifiedBy: currentUser.name || currentUser.email || 'Unknown'
      }

      // 保存详情
      const detailSaved = await saveDetail(updatedDetail)
      if (!detailSaved) throw new Error('Failed to save detail')

      // 更新索引
      const indexes = await getIndexes()
      const index = indexes.findIndex(idx => idx.id === id)
      if (index !== -1) {
        indexes[index] = {
          id,
          type,
          title: updatedDetail.title,
          status: updatedDetail.status,
          updatedAt: now
        }
        const indexSaved = await saveIndex(indexes)
        if (!indexSaved) throw new Error('Failed to save index')
      }

      setItems(prev => prev.map(item => item.id === id ? updatedDetail : item))
      return updatedDetail
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
      setError(`Failed to update ${type}`)
      return null
    } finally {
      setLoading(false)
    }
  }, [type, getDetail, saveDetail, getIndexes, saveIndex])

  /**
   * 删除项目
   */
  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      // 删除详情
      await deleteMetadata({ name: `${type}_${id}` })

      // 更新索引
      const indexes = await getIndexes()
      const filteredIndexes = indexes.filter(idx => idx.id !== id)
      await saveIndex(filteredIndexes)

      setItems(prev => prev.filter(item => item.id !== id))
      return true
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      setError(`Failed to delete ${type}`)
      return false
    } finally {
      setLoading(false)
    }
  }, [type, getIndexes, saveIndex])

  /**
   * 获取历史记录
   */
  const getHistory = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const history = await queryMetadataHistory({ names: [`${type}_${id}`] })
      return history.data.map(item => ({
        updatedAt: item.updatedAt,
        versionCode: item.versionCode,
        modifiedBy: jsonParse(item.value).modifiedBy || 'Unknown',
        value: item.value
      }))
    } catch (error) {
      console.error(`Error getting ${type} history:`, error)
      setError(`Failed to get ${type} history`)
      return []
    } finally {
      setLoading(false)
    }
  }, [type])

  /**
   * 加载列表
   */
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const indexes = await getIndexes()
      const details = await Promise.all(
        indexes.map(index => getDetail(index.id))
      )
      const validDetails = details.filter((d): d is MetadataDetail<T> => d !== null)
      setItems(validDetails)
      return validDetails
    } catch (error) {
      console.error(`Error loading ${type} list:`, error)
      setError(`Failed to load ${type} list`)
      return []
    } finally {
      setLoading(false)
    }
  }, [type, getIndexes, getDetail])

  /**
   * 复制项目
   */
  const copy = useCallback(async (id: string, options: { 
    resetStatus?: boolean
    resetDates?: boolean
    suffix?: string
    onBeforeCopy?: (detail: MetadataDetail<T>) => Promise<MetadataDetail<T>>
  } = {}) => {
    const {
      resetStatus = true,
      resetDates = true,
      suffix = '_copy',
      onBeforeCopy
    } = options

    setLoading(true)
    setError(null)
    try {
      // 获取原始数据
      const originalDetail = await getDetail(id)
      if (!originalDetail) throw new Error('Original item not found')

      // 创建新数据
      let newDetail: MetadataDetail<T> = {
        ...originalDetail,
        id: `${type}_${Date.now()}`,
        title: `${originalDetail.title}${suffix}`,
        status: resetStatus ? 'draft' : originalDetail.status,
      }

      if (resetDates) {
        const now = new Date().toISOString()
        newDetail.createdAt = now
        newDetail.updatedAt = now
      }

      // 执行复制前的钩子
      if (onBeforeCopy) {
        newDetail = await onBeforeCopy(newDetail)
      }

      // 创建新项目
      const result = await create(newDetail)
      if (!result) throw new Error('Failed to create copy')

      return result
    } catch (error) {
      console.error(`Error copying ${type}:`, error)
      setError(`Failed to copy ${type}`)
      return null
    } finally {
      setLoading(false)
    }
  }, [type, getDetail, create])

  return {
    items,
    loading,
    error,
    load,
    create,
    update,
    remove,
    getDetail,
    getHistory,
    copy
  }
}