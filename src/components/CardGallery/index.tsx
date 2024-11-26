import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import SearchInput from "@/components/SearchInput"

export interface CardGalleryProps<T> {
  items: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  emptyState?: React.ReactNode
  searchEmptyState?: React.ReactNode
  className?: string
  containerClassName?: string
  loadingState?: React.ReactNode
  isLoading?: boolean
  gridClassName?: string
  searchable?: boolean
  searchFields?: (keyof T)[]
  searchPlaceholder?: string
  onSearch?: (searchValue: string) => void
  customSearch?: (item: T, searchValue: string) => boolean
}

const DefaultSearchEmptyState: React.FC<{
  searchValue: string
  onClear: () => void
}> = ({ searchValue, onClear }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <Icon icon="mdi:search-off" className="w-16 h-16 text-default-300" />
    <p className="mt-4 text-default-500">
      未找到匹配 "{searchValue}" 的内容
    </p>
    <Button
      className="mt-4"
      variant="light"
      onClick={onClear}
    >
      清除搜索
    </Button>
  </div>
)

function CardGallery<T>({
  items,
  renderCard,
  emptyState,
  searchEmptyState,
  className = "",
  containerClassName = "",
  loadingState,
  isLoading = false,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6",
  searchable = false,
  searchFields,
  searchPlaceholder,
  onSearch,
  customSearch,
}: CardGalleryProps<T>) {
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const getFilteredItems = (items: T[], searchValue: string) => {
    if (!searchValue.trim()) return items

    if (customSearch) {
      return items.filter(item => customSearch(item, searchValue))
    }

    if (searchFields?.length) {
      return items.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return typeof value === 'string' && 
            value.toLowerCase().includes(searchValue.toLowerCase())
        })
      )
    }

    // 默认搜索 title 字段
    return items.filter(item => 
      'title' in item && 
      typeof (item as any).title === 'string' && 
      (item as any).title.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  const filteredItems = React.useMemo(() => 
    getFilteredItems(items, searchValue),
    [items, searchValue, customSearch, searchFields]
  )

  const renderContent = () => {
    // 处理加载状态
    if (isLoading && loadingState) {
      return loadingState
    }

    // 处理搜索无结果状态
    if (searchable && searchValue && filteredItems.length === 0) {
      return searchEmptyState || (
        <DefaultSearchEmptyState 
          searchValue={searchValue}
          onClear={() => handleSearch("")}
        />
      )
    }

    // 处理真正的空状态
    if (!isLoading && items.length === 0 && emptyState) {
      return emptyState
    }

    // 渲染卡片列表
    return (
      <div className={gridClassName}>
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="h-full"
            >
              {renderCard(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`h-full overflow-hidden ${containerClassName}`}>
      <div className={`h-full overflow-auto ${className}`}>
        {searchable && (
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-4 px-6">
            <SearchInput
              value={searchValue}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="w-full max-w-sm"
            />
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  )
}

export default CardGallery