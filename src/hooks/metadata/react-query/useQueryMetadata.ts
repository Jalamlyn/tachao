import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { deleteMetadata } from "@/service/apis/api"
import { getCurrentAccountInfo } from "@/service/apis/user"
import { MetadataDetail, MetadataIndex } from "../types"
import { generateMetadataId, logger } from "../utils"
import { useQueryMetadataIndex } from "./useQueryMetadataIndex"
import { useQueryMetadataDetail } from "./useQueryMetadataDetail"
import { useQueryMetadataHistory } from "./useQueryMetadataHistory"
import { QueryMetadataOptions } from "./types"
import message from "@/components/Message"
import { Button } from "@nextui-org/react"

/**
 * 使用 React Query 重写的元数据管理 Hook
 */
export function useQueryMetadata<T = any>(type: string, options: QueryMetadataOptions = {}) {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: indexes = [], saveIndex } = useQueryMetadataIndex(type, options)
  const { data: detail, saveDetail } = useQueryMetadataDetail<T>(type, "", options)
  const { data: history } = useQueryMetadataHistory(type, "", options)

  // ✅ 在顶层调用 Hook 获取 form 索引
  const { data: formIndexes = [] } = useQueryMetadataIndex("form", options)

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
        const newIndex: MetadataIndex = {
          id: normalizedId,
          type,
          title: detail.title,
          status: detail.status,
          updatedAt: now,
          template: detail.template,
          indexFields: detail.indexFields,
        }
        const indexSaved = await saveIndex([...indexes, newIndex])
        if (!indexSaved) throw new Error("Failed to save index")

        logger.debug("[useQueryMetadata] Item created successfully", { id: normalizedId })
        return detail
      } catch (error) {
        logger.error(`[useQueryMetadata] Error creating ${type}`, error as Error)
        setError(`Failed to create ${type}`)
        return null
      }
    },
    [type, saveDetail, saveIndex, indexes]
  )

  /**
   * 更新项目
   */
  const update = useCallback(
    async (id: string, data: Partial<MetadataDetail<T>>) => {
      logger.debug("[useQueryMetadata] Updating item", { type, id })
      setError(null)
      try {
        const currentDetail = await queryClient.fetchQuery({
          queryKey: [`metadata-detail-${type}`, id],
          queryFn: () => detail,
        })
        
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
          const indexSaved = await saveIndex(updatedIndexes)
          if (!indexSaved) throw new Error("Failed to save index")
        }

        logger.debug("[useQueryMetadata] Item updated successfully", { id })
        return updatedDetail
      } catch (error) {
        logger.error(`[useQueryMetadata] Error updating ${type}`, error as Error, { id })
        setError(`Failed to update ${type}`)
        return null
      }
    },
    [type, detail, queryClient, saveDetail, indexes, saveIndex]
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
                  href='/we-chat-app/admin/forms?templateId=${id}'
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
        await saveIndex(filteredIndexes)

        // 使缓存失效
        queryClient.invalidateQueries({ queryKey: [`metadata-detail-${type}`, id] })
        queryClient.invalidateQueries({ queryKey: [`metadata-index-${type}`] })

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
    detail,
    history,
    create,
    update,
    remove,
    checkTemplateUsage,
  }
}

export * from "./types"
export * from "../utils"
export { useQueryMetadataIndex } from "./useQueryMetadataIndex"
export { useQueryMetadataDetail } from "./useQueryMetadataDetail"
export { useQueryMetadataHistory } from "./useQueryMetadataHistory"