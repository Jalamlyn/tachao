import { useState, useCallback, useMemo, useEffect } from "react"
import { MetadataDetail, useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import type { PaginationConfig } from "./types"

interface UseMetadataTableOptions {
  type: string
  searchFields?: string[]
  pagination?: PaginationConfig | false
  onDataChange?: (data: MetadataDetail[]) => void
  onError?: (error: Error) => void
}

export function useMetadataTable<T extends MetadataDetail>({
  type,
  searchFields = ["title"],
  pagination = { defaultPageSize: 10, pageSizeOptions: [10, 20, 50, 100] },
  onDataChange,
  onError,
}: UseMetadataTableOptions) {
  // 搜索状态
  const [searchValue, setSearchValue] = useState("")
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pagination?.defaultPageSize || 10)

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
    setCurrentPage(1) // 重置到第一页
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

  // 计算分页数据
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize, pagination])

  // 判断是否是搜索导致的空结果
  const isEmptySearchResult = useMemo(() => {
    return searchValue && data.length > 0 && filteredData.length === 0
  }, [searchValue, data.length, filteredData.length])

  // 分页处理函数
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // 重置到第一页
  }, [])

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
    data: paginatedData,
    loading,
    error,
    searchValue,
    isEmptySearchResult,
    currentPage,
    pageSize,
    total: filteredData.length,
    handleSearch,
    handleRefresh,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
  }
}