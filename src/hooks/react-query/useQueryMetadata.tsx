import { useState, useCallback } from "react"
import { useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { deleteMetadata } from "@/service/apis/api"
import { getCurrentAccountInfo } from "@/service/apis/user"
import { MetadataDetail, MetadataIndex } from "@/hooks/metadata/types"
import { generateMetadataId, logger } from "@/hooks/metadata/utils"
import { useQueryMetadataIndex } from "@/hooks/react-query/useQueryMetadataIndex"
import { useQueryMetadataDetail } from "@/hooks/react-query/useQueryMetadataDetail"
import { useQueryMetadataHistory } from "@/hooks/react-query/useQueryMetadataHistory"
import { QueryMetadataOptions } from "@/hooks/react-query/types"
import message from "@/components/Message"
import { Button } from "@nextui-org/react"

/**
 * 使用 React Query 重写的元数据管理 Hook
 */
export function useQueryMetadata<T = any>(type: string, options: QueryMetadataOptions = {}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  const { data: indexes = [], saveIndex } = useQueryMetadataIndex(type, options)
  const { getHistory } = useQueryMetadataHistory(type, "", options)

  // ✅ 在顶层调用 Hook 获取 form 索引
  const { data: formIndexes = [] } = useQueryMetadataIndex("form", options)

  /**
   * 获取详情数据
   */
  const getDetail = useCallback(async (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids]
    logger.debug("[useQueryMetadata] Getting details", { type, ids: idArray })
    
    try {
      const { data } = await queryClient.fetchQuery({
        queryKey: [`metadata-detail-${type}`, idArray],
        queryFn: () => useQueryMetadataDetail(type, idArray, options).data
      })
      return Array.isArray(ids) ? data : data[0]
    } catch (error) {
      logger.error(`[useQueryMetadata] Error getting ${type} details`, error as Error)
      throw error
    }
  }, [type, queryClient, options])

  /**
   * 加载列表
   */
  const load = useCallback(async () => {
    logger.debug("[useQueryMetadata] Loading list", { type })
    try {
      const indexes = await queryClient.fetchQuery({
        queryKey: [`metadata-index-${type}`]
      })
      return indexes
    } catch (error) {
      logger.error(`[useQueryMetadata] Error loading ${type} list`, error as Error)
      throw error
    }
  }, [type, queryClient])

  /**
   * 加载列表(包含详情)
   */
  const loadWithDetails = useCallback(async () => {
    logger.debug("[useQueryMetadata] Loading list with details", { type })
    try {
      const indexes = await load()
      const details = await getDetail(indexes.map(idx => idx.id))
      return details
    } catch (error) {
      logger.error(`[useQueryMetadata] Error loading ${type} list with details`, error as Error)
      throw error
    }
  }, [type, load, getDetail])

  /**
   * 根据索引字段筛选并加载详情
   */
  const loadFilteredDetails = useCallback(async (filter: (index: MetadataIndex) => boolean) => {
    logger.debug("[useQueryMetadata] Loading filtered details", { type })
    try {
      const indexes = await load()
      const filteredIds = indexes.filter(filter).map(idx => idx.id)
      return await getDetail(filteredIds)
    } catch (error) {
      logger.error(`[useQueryMetadata] Error loading filtered ${type} details`, error as Error)
      throw error
    }
  }, [type, load, getDetail])

  /**
   * 创建新项目
   */
  const create = useCallback(
    async (data: Partial<MetadataDetail<T>>) => {
      logger.debug("[useQueryMetadata] Creating new item", { type })
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
        const { saveDetail } = useQueryMetadataDetail<T>(type, normalizedId, options)
        const detailSaved = await saveDetail(detail)
        if (!detailSaved) throw new Error("Failed to save detail")

        // 更新索引
        const newIndex: MetadataIndex = {
          id: normalizedId,
          type,
          title: detail.title,
          status: detail.status,
          updatedAt: now,
          template: detail.template,
          indexFields: detail.indexFields,
        }

        startTransition(() => {
          saveIndex([...indexes, newIndex])
        })

        logger.debug("[useQueryMetadata] Item created successfully", { id: normalizedId })
        return detail
      } catch (error) {
        logger.error(`[useQueryMetadata] Error creating ${type}`, error as Error)
        setError(`Failed to create ${type}`)
        return null
      }
    },
    [type, indexes, saveIndex, options]
  )

  /**
   * 更新项目
   */
  const update = useCallback(
    async (id: string, data: Partial<MetadataDetail<T>>) => {
      logger.debug("[useQueryMetadata] Updating item", { type, id })
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
        const { saveDetail } = useQueryMetadataDetail<T>(type, id, options)
        const detailSaved = await saveDetail(updatedDetail)
        if (!detailSaved) throw new Error("Failed to save detail")

        // 更新索引
        const index = indexes.findIndex((idx) => idx.id === id)
        if (index !== -1) {
          const updatedIndexes = [...indexes]
          updatedIndexes[index] = {
            id,
            type,
            title: updatedDetail.title,
            status: updatedDetail.status,
            updatedAt: now,
            template: updatedDetail.template,
            indexFields: updatedDetail.indexFields,
          }
          startTransition(() => {
            saveIndex(updatedIndexes)
          })
        }

        logger.debug("[useQueryMetadata] Item updated successfully", { id })
        return updatedDetail
      } catch (error) {
        logger.error(`[useQueryMetadata] Error updating ${type}`, error as Error, { id })
        setError(`Failed to update ${type}`)
        return null
      }
    },
    [type, getDetail, indexes, saveIndex, options]
  )

  /**
   * 检查模板使用情况
   */
  const checkTemplateUsage = useCallback(
    async (templateId: string) => {
      logger.debug("[useQueryMetadata] Checking template usage", { templateId })
      try {
        // 筛选使用该模板的表单
        const formsUsingTemplate = formIndexes.filter((index) => index.indexFields?.templateId === templateId)

        if (formsUsingTemplate.length > 0) {
          return {
            inUse: true,
            count: formsUsingTemplate.length,
            forms: formsUsingTemplate.map((form) => ({
              id: form.id,
              title: form.title,
              status: form.status,
            })),
          }
        }

        return {
          inUse: false,
          count: 0,
          forms: [],
        }
      } catch (error) {
        logger.error("[useQueryMetadata] Error checking template usage", error as Error)
        throw new Error("检查模板使用情况时发生错误")
      }
    },
    [formIndexes]
  )

  /**
   * 删除项目
   */
  const remove = useCallback(
    async (id: string) => {
      logger.debug("[useQueryMetadata] Removing item", { type, id })
      setError(null)
      try {
        // 如果是模板类型，先检查是否有表单在使用
        if (type === "template") {
          const usage = await checkTemplateUsage(id)
          if (usage.inUse) {
            message.error(
              <div className='flex flex-col gap-2'>
                <p>无法删除此模板，因为还有 {usage.count} 个表单正在使用它。</p>
                <p>请先删除这些表单后再尝试删除模板。</p>
                <Button
                  color='primary'
                  size='sm'
                  as='a'
                  href='/admin/forms?templateId=${id}'
                  target='_blank'
                >
                  <span>查看使用此模板的表单</span>
                </Button>
              </div>
            )
            throw new Error(`无法删除此模板`)
          }
        }

        // 删除详情
        await deleteMetadata({ name: `${id}` })

        // 更新索引
        const filteredIndexes = indexes.filter((idx) => idx.id !== id)
        startTransition(() => {
          saveIndex(filteredIndexes)
        })

        // 使缓存失效
        startTransition(() => {
          queryClient.invalidateQueries({ queryKey: [`metadata-detail-${type}`, id] })
          queryClient.invalidateQueries({ queryKey: [`metadata-index-${type}`] })
        })

        logger.debug("[useQueryMetadata] Item removed successfully", { id })
        return true
      } catch (error) {
        logger.error(`[useQueryMetadata] Error deleting ${type}`, error as Error, { id })
        setError((error as Error).message || `Failed to delete ${type}`)
        return false
      }
    },
    [type, indexes, saveIndex, checkTemplateUsage, queryClient]
  )

  return {
    items: indexes,
    error,
    isPending,
    load,
    loadWithDetails,
    loadFilteredDetails,
    create,
    update,
    remove,
    getDetail,
    getHistory,
    checkTemplateUsage,
  }
}

export * from "@/hooks/react-query/types"
export * from "@/hooks/metadata/utils"
export { useQueryMetadataIndex } from "@/hooks/react-query/useQueryMetadataIndex"
export { useQueryMetadataDetail } from "@/hooks/react-query/useQueryMetadataDetail"
export { useQueryMetadataHistory } from "@/hooks/react-query/useQueryMetadataHistory"