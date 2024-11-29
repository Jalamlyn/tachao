import { useState, useCallback, useEffect } from "react"
import { useMetadata } from "@/hooks/metadata"
import { Tag, TagsIndex, TagType } from "@/types/tag"
import message from "@/components/Message"

export const useTagManagement = (type: TagType) => {
  const { getDetail, create, update } = useMetadata("tags")
  const [tagsIndex, setTagsIndex] = useState<TagsIndex | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // 加载标签索引
  const loadTagsIndex = async () => {
    setLoading(true)
    try {
      const index = await getDetail("tags_index")
      if (index) {
        setTagsIndex(index.data)
      } else {
        // 创建初始结构
        const initialIndex: TagsIndex = {
          tags: [],
          relations: {
            template: { byItem: {}, byTag: {} },
            report: { byItem: {}, byTag: {} },
            document: { byItem: {}, byTag: {} },
          },
        }

        // 使用 create 创建新的标签索引
        const result = await create({
          id: "tags_index",
          title: "Tags Index",
          type: "tags",
          status: "active",
          data: initialIndex,
          indexFields: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })

        if (result?.data) {
          setTagsIndex(result.data)
        } else {
          throw new Error("Failed to create tags index")
        }
      }
    } catch (error) {
      console.error("Error loading tags index:", error)
      message.error("加载标签数据失败")
    } finally {
      setLoading(false)
      setLastUpdate(Date.now())
    }
  }

  // 保存标签索引的辅助函数
  const saveTagsIndex = async (newIndex: TagsIndex) => {
    try {
      const result = await update("tags_index", {
        title: "Tags Index",
        type: "tags",
        status: "active",
        data: newIndex,
        indexFields: {
          updatedAt: new Date().toISOString(),
        }
      })
      
      if (result?.data) {
        setTagsIndex(result.data)
        setLastUpdate(Date.now())
        return true
      }
      return false
    } catch (error) {
      console.error("Error saving tags index:", error)
      return false
    }
  }

  // 自动加载标签索引
  useEffect(() => {
    loadTagsIndex()
  }, [])

  // 创建新标签
  const createTag = async (tag: Omit<Tag, "id" | "createdAt" | "updatedAt">) => {
    if (!tagsIndex) return null

    try {
      const newTag: Tag = {
        ...tag,
        id: `tag_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedIndex = {
        ...tagsIndex,
        tags: [...tagsIndex.tags, newTag],
        relations: {
          ...tagsIndex.relations,
          [type]: {
            byItem: { ...tagsIndex.relations[type]?.byItem },
            byTag: { ...tagsIndex.relations[type]?.byTag, [newTag.id]: [] },
          },
        },
      }

      const saved = await saveTagsIndex(updatedIndex)
      if (saved) {
        // 立即更新本地状态
        setTagsIndex(updatedIndex)
        setLastUpdate(Date.now())
        message.success("标签创建成功")
        return newTag
      }
      return null
    } catch (error) {
      console.error("Error creating tag:", error)
      message.error("创建标签失败")
      return null
    }
  }

  // 删除标签
  const deleteTag = async (tagId: string) => {
    if (!tagsIndex) return false

    try {
      // 检查标签是否在使用中
      const usageCount = tagsIndex.relations[type]?.byTag[tagId]?.length || 0
      if (usageCount > 0) {
        message.error(`无法删除标签，当前有 ${usageCount} 个项目正在使用此标签`)
        return false
      }

      const updatedIndex = {
        ...tagsIndex,
        tags: tagsIndex.tags.filter((tag) => tag.id !== tagId),
        relations: {
          ...tagsIndex.relations,
          [type]: {
            byItem: { ...tagsIndex.relations[type].byItem },
            byTag: { ...tagsIndex.relations[type].byTag },
          },
        },
      }

      // 删除关系映射
      delete updatedIndex.relations[type].byTag[tagId]
      Object.keys(updatedIndex.relations[type].byItem).forEach((itemId) => {
        updatedIndex.relations[type].byItem[itemId] = updatedIndex.relations[type].byItem[itemId].filter(
          (id) => id !== tagId
        )
      })

      const saved = await saveTagsIndex(updatedIndex)
      if (saved) {
        // 立即更新本地状态
        setTagsIndex(updatedIndex)
        setLastUpdate(Date.now())
        message.success("标签删除成功")
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting tag:", error)
      message.error("删除标签失败")
      return false
    }
  }

  // 更新标签关系
  const updateItemTags = async (itemId: string, tagIds: string[]) => {
    if (!tagsIndex) return false

    try {
      const oldTagIds = tagsIndex.relations[type]?.byItem[itemId] || []

      // 更新关系映射
      const updatedRelations = {
        ...tagsIndex.relations,
        [type]: {
          byItem: {
            ...tagsIndex.relations[type]?.byItem,
            [itemId]: tagIds,
          },
          byTag: {
            ...tagsIndex.relations[type]?.byTag,
          },
        },
      }

      // 更新 byTag 映射
      oldTagIds.forEach((tagId) => {
        updatedRelations[type].byTag[tagId] = updatedRelations[type].byTag[tagId].filter((id) => id !== itemId)
      })

      tagIds.forEach((tagId) => {
        if (!updatedRelations[type].byTag[tagId]) {
          updatedRelations[type].byTag[tagId] = []
        }
        if (!updatedRelations[type].byTag[tagId].includes(itemId)) {
          updatedRelations[type].byTag[tagId].push(itemId)
        }
      })

      const updatedIndex = {
        ...tagsIndex,
        relations: updatedRelations,
      }

      const saved = await saveTagsIndex(updatedIndex)
      if (saved) {
        setLastUpdate(Date.now())
      }
      return saved
    } catch (error) {
      console.error("Error updating item tags:", error)
      message.error("更新标签关系失败")
      return false
    }
  }

  // 获取项目的标签
  const getItemTags = useCallback(
    (itemId: string) => {
      if (!tagsIndex) return []
      const tagIds = tagsIndex.relations[type]?.byItem[itemId] || []
      return tagsIndex.tags.filter((tag) => tagIds.includes(tag.id))
    },
    [tagsIndex, type]
  )

  // 根据标签筛选项目
  const filterItemsByTags = useCallback(
    (items: any[], selectedTags: string[]) => {
      if (!tagsIndex || selectedTags.length === 0) return items

      return items.filter((item) => {
        const itemTags = tagsIndex.relations[type]?.byItem[item.id] || []
        return selectedTags.every((tagId) => itemTags.includes(tagId))
      })
    },
    [tagsIndex, type]
  )

  // 获取标签使用次数
  const getTagUsageCount = useCallback(
    (tagId: string) => {
      if (!tagsIndex) return 0
      return tagsIndex.relations[type]?.byTag[tagId]?.length || 0
    },
    [tagsIndex, type]
  )

  return {
    tagsIndex,
    loading,
    lastUpdate,
    loadTagsIndex,
    createTag,
    deleteTag,
    updateItemTags,
    getItemTags,
    filterItemsByTags,
    getTagUsageCount,
  }
}