import { useState, useCallback, useEffect } from "react"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { Tag, TagsIndex, TagType } from "@/types/tag"
import message from "@/components/Message"

export const useTagManagement = (type: TagType) => {
  const [tagsIndex, setTagsIndex] = useState<TagsIndex | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // 加载标签索引
  const loadTagsIndex = async () => {
    setLoading(true)
    try {
      const result = await getMetadata(["tags_index"])
      if (result.data?.[0]?.value) {
        const index = JSON.parse(result.data[0].value)
        setTagsIndex(index)
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

        // 创建新的标签索引
        await setMetadata("tags_index", JSON.stringify(initialIndex))
        setTagsIndex(initialIndex)
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
      await setMetadata("tags_index", JSON.stringify(newIndex))
      return true
    } catch (error) {
      console.error("Error saving tags index:", error)
      return false
    }
  }

  // 自动加载标签索引
  useEffect(() => {
    loadTagsIndex()
  }, [])

  // 创建新标签 - 使用乐观更新
  const createTag = async (tag: Omit<Tag, "id" | "createdAt" | "updatedAt">) => {
    if (!tagsIndex) return null

    // 1. 创建新标签对象
    const newTag: Tag = {
      ...tag,
      id: `tag_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 2. 乐观更新本地状态
    const optimisticIndex = {
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

    // 立即更新UI
    setTagsIndex(optimisticIndex)
    setLastUpdate(Date.now())

    try {
      // 3. 执行实际的API调用
      const saved = await saveTagsIndex(optimisticIndex)
      if (saved) {
        return newTag
      }

      // 4. 如果保存失败,回滚状态
      setTagsIndex(tagsIndex)
      setLastUpdate(Date.now())
      message.error("创建标签失败")
      return null
    } catch (error) {
      // 5. 发生错误时回滚
      setTagsIndex(tagsIndex)
      setLastUpdate(Date.now())
      console.error("Error creating tag:", error)
      message.error("创建标签失败")
      return null
    }
  }

  // 删除标签 - 使用乐观更新
  const deleteTag = async (tagId: string) => {
    if (!tagsIndex) return false

    try {
      // 1. 创建乐观更新的新状态
      const optimisticIndex = {
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
      delete optimisticIndex.relations[type].byTag[tagId]
      Object.keys(optimisticIndex.relations[type].byItem).forEach((itemId) => {
        optimisticIndex.relations[type].byItem[itemId] = optimisticIndex.relations[type].byItem[itemId].filter(
          (id) => id !== tagId
        )
      })

      // 2. 立即更新UI
      setTagsIndex(optimisticIndex)
      setLastUpdate(Date.now())

      // 3. 执行实际的API调用
      const saved = await saveTagsIndex(optimisticIndex)
      if (saved) {
        return true
      }

      // 4. 如果保存失败,回滚状态
      setTagsIndex(tagsIndex)
      setLastUpdate(Date.now())
      message.error("删除标签失败")
      return false
    } catch (error) {
      // 5. 发生错误时回滚
      setTagsIndex(tagsIndex)
      setLastUpdate(Date.now())
      console.error("Error deleting tag:", error)
      message.error("删除标签失败")
      return false
    }
  }

  // 更新标签关系 - 使用乐观更新
  const updateItemTags = async (itemId: string, tagIds: string[]) => {
    if (!tagsIndex) return false

    try {
      const oldTagIds = tagsIndex.relations[type]?.byItem[itemId] || []

      // 1. 创建乐观更新的新状态
      const optimisticRelations = {
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
        optimisticRelations[type].byTag[tagId] = optimisticRelations[type].byTag[tagId].filter((id) => id !== itemId)
      })

      tagIds.forEach((tagId) => {
        if (!optimisticRelations[type].byTag[tagId]) {
          optimisticRelations[type].byTag[tagId] = []
        }
        if (!optimisticRelations[type].byTag[tagId].includes(itemId)) {
          optimisticRelations[type].byTag[tagId].push(itemId)
        }
      })

      const optimisticIndex = {
        ...tagsIndex,
        relations: optimisticRelations,
      }

      // 2. 立即更新UI
      setTagsIndex(optimisticIndex)
      setLastUpdate(Date.now())

      // 3. 执行实际的API调用
      const saved = await saveTagsIndex(optimisticIndex)
      if (saved) {
        return true
      }

      // 4. 如果保存失败,回滚状态
      setTagsIndex(tagsIndex)
      setLastUpdate(Date.now())
      message.error("更新标签关系失败")
      return false
    } catch (error) {
      // 5. 发生错误时回滚
      setTagsIndex(tagsIndex)
      setLastUpdate(Date.now())
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
