import { useState, useCallback, useMemo, useEffect } from "react"
import { MetadataDetail, useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"

interface UseMetadataTableOptions {
  type: string
  searchFields?: string[]
  onDataChange?: (data: MetadataDetail[]) => void
  onError?: (error: Error) => void
}

export function useMetadataTable<T extends MetadataDetail>({
  type,
  searchFields = ["title"],
  onDataChange,
  onError,
}: UseMetadataTableOptions) {
  // 搜索状态
  const [searchValue, setSearchValue] = useState("")

  // 使用 useMetadata hook
  const { items: data, loading, error, load: loadData, remove: removeItem } = useMetadata<T>(type)

  // 初始化加载数据
  useEffect(() => {
    loadData().catch((error) => {
      console.error(`Error loading ${type}:`, error)
      message.error("加载数据失败")
      onError?.(error as Error)
    })
  }, [loadData, type, onError])

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  // 过滤数据
  const filteredData = useMemo(() => {
    if (!searchValue) return data
    const searchLower = searchValue.toLowerCase()
    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = field.split(".").reduce((obj, key) => obj?.[key], item)
        return String(value).toLowerCase().includes(searchLower)
      })
    })
  }, [data, searchValue, searchFields])

  // 判断是否是搜索导致的空结果
  const isEmptySearchResult = useMemo(() => {
    return searchValue && data.length > 0 && filteredData.length === 0
  }, [searchValue, data.length, filteredData.length])

  // 刷新数据
  const handleRefresh = useCallback(async () => {
    try {
      await loadData()
      onDataChange?.(data)
    } catch (error) {
      console.error(`Error refreshing ${type}:`, error)
      message.error("刷新失败")
      onError?.(error as Error)
    }
  }, [loadData, data, type, onDataChange, onError])

  // 删除数据
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await removeItem(id)
        message.success("删除成功")
        handleRefresh()
      } catch (error) {
        console.error(`Error deleting ${type}:`, error)
        message.error("删除失败")
        onError?.(error as Error)
      }
    },
    [removeItem, handleRefresh, type, onError]
  )

  return {
    data: filteredData,
    loading,
    error,
    searchValue,
    isEmptySearchResult,
    handleSearch,
    handleRefresh,
    handleDelete,
  }
}