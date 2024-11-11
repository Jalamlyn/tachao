import { useState, useCallback } from "react"
import { useMetadata, MetadataDetail } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"
import { logger } from "@/utils/logger"

export interface Resource extends MetadataDetail {
  name: string
  type: string
  size: string
  status: "active" | "processing" | "error"
  description?: string
  data?: any[]
}

export function useResourceMetadata(appId?: string | null) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])

  const metadataManager = useMetadata("resource")

  // 加载资料列表
  const loadResources = useCallback(async () => {
    if (!appId) return

    setLoading(true)
    setError(null)

    try {
      const items = await metadataManager.loadWithDetails()
      setResources(items as Resource[])
      logger.debug("[useResourceMetadata] Resources loaded", { count: items.length })
    } catch (err) {
      const errorMessage = "Failed to load resources"
      logger.error("[useResourceMetadata] Error loading resources", err)
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [appId, metadataManager])

  // 创建新资料
  const createResource = useCallback(
    async (resource: Partial<Resource>) => {
      if (!appId) return null

      setLoading(true)
      setError(null)

      try {
        const newResource = await metadataManager.create({
          ...resource,
          type: resource.type || "excel",
          status: "active",
        })

        if (newResource) {
          setResources((prev) => [...prev, newResource as Resource])
          logger.debug("[useResourceMetadata] Resource created", { id: newResource.id })
          message.success("资料创建成功")
          return newResource as Resource
        }
        return null
      } catch (err) {
        const errorMessage = "Failed to create resource"
        logger.error("[useResourceMetadata] Error creating resource", err)
        setError(errorMessage)
        message.error(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [appId, metadataManager]
  )

  // 更新资料
  const updateResource = useCallback(
    async (id: string, updates: Partial<Resource>) => {
      if (!appId) return null

      setLoading(true)
      setError(null)

      try {
        const updatedResource = await metadataManager.update(id, updates)
        if (updatedResource) {
          setResources((prev) =>
            prev.map((resource) => (resource.id === id ? (updatedResource as Resource) : resource))
          )
          logger.debug("[useResourceMetadata] Resource updated", { id })
          message.success("资料更新成功")
          return updatedResource as Resource
        }
        return null
      } catch (err) {
        const errorMessage = "Failed to update resource"
        logger.error("[useResourceMetadata] Error updating resource", err)
        setError(errorMessage)
        message.error(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [appId, metadataManager]
  )

  // 删除资料
  const deleteResource = useCallback(
    async (id: string) => {
      if (!appId) return false

      setLoading(true)
      setError(null)

      try {
        const success = await metadataManager.remove(id)
        if (success) {
          setResources((prev) => prev.filter((resource) => resource.id !== id))
          logger.debug("[useResourceMetadata] Resource deleted", { id })
          message.success("资料删除成功")
        }
        return success
      } catch (err) {
        const errorMessage = "Failed to delete resource"
        logger.error("[useResourceMetadata] Error deleting resource", err)
        setError(errorMessage)
        message.error(errorMessage)
        return false
      } finally {
        setLoading(false)
      }
    },
    [appId, metadataManager]
  )

  // 获取资料详情
  const getResourceDetail = useCallback(
    async (id: string) => {
      if (!appId) return null

      try {
        const detail = await metadataManager.getDetail(id)
        logger.debug("[useResourceMetadata] Resource detail loaded", { id })
        return detail as Resource | null
      } catch (err) {
        const errorMessage = "Failed to get resource detail"
        logger.error("[useResourceMetadata] Error getting resource detail", err)
        message.error(errorMessage)
        return null
      }
    },
    [appId, metadataManager]
  )

  // 获取资料历史记录
  const getResourceHistory = useCallback(
    async (id: string) => {
      if (!appId) return []

      try {
        const history = await metadataManager.getHistory(id)
        logger.debug("[useResourceMetadata] Resource history loaded", {
          id,
          count: history.length,
        })
        return history
      } catch (err) {
        const errorMessage = "Failed to get resource history"
        logger.error("[useResourceMetadata] Error getting resource history", err)
        message.error(errorMessage)
        return []
      }
    },
    [appId, metadataManager]
  )

  return {
    resources,
    loading,
    error,
    loadResources,
    createResource,
    updateResource,
    deleteResource,
    getResourceDetail,
    getResourceHistory,
  }
}