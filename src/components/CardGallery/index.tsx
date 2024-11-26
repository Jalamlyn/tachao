import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SearchInput from "@/components/SearchInput"

export interface CardGalleryProps<T> {
  items: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  emptyState?: React.ReactNode
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

function CardGallery<T>({
  items,
  renderCard,
  emptyState,
  className = "",
  containerClassName = "",
  loadingState,
  isLoading = false,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6",
  searchable = false,
  searchPlaceholder,
  onSearch,
  customSearch,
}: CardGalleryProps<T>) {
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const filteredItems = React.useMemo(() => {
    if (!searchValue || (!customSearch && !searchable)) return items

    return items.filter((item) => {
      if (customSearch) {
        return customSearch(item, searchValue)
      }
      return false
    })
  }, [items, searchValue, customSearch, searchable])

  // 处理加载状态
  if (isLoading && loadingState) {
    return loadingState
  }

  // 处理空状态
  if (!isLoading && (!filteredItems || filteredItems.length === 0) && emptyState) {
    return emptyState
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
      </div>
    </div>
  )
}

export default CardGallery