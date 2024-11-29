import React, { useState } from "react"
import { Button, ScrollShadow } from "@nextui-org/react"
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
  renderHeader?: (searchProps: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }) => React.ReactNode
}

const DefaultSearchEmptyState: React.FC<{
  searchValue: string
  onClear: () => void
}> = ({ searchValue, onClear }) => (
  <div className='flex flex-col items-center justify-center p-8'>
    <Icon icon='mdi:search-off' className='w-16 h-16 text-default-300' />
    <p className='mt-4 text-default-500'>未找到匹配 "{searchValue}" 的内容</p>
    <Button className='mt-4' variant='light' onClick={onClear}>
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
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4",
  searchable = false,
  searchFields,
  searchPlaceholder,
  onSearch,
  customSearch,
  renderHeader,
}: CardGalleryProps<T>) {
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const getFilteredItems = (items: T[], searchValue: string) => {
    if (!searchValue.trim()) return items

    if (customSearch) {
      return items.filter((item) => customSearch(item, searchValue))
    }

    if (searchFields?.length) {
      return items.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return typeof value === "string" && value.toLowerCase().includes(searchValue.toLowerCase())
        })
      )
    }

    return items.filter(
      (item) =>
        "title" in item &&
        typeof (item as any).title === "string" &&
        (item as any).title.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  const filteredItems = React.useMemo(
    () => getFilteredItems(items, searchValue),
    [items, searchValue, customSearch, searchFields]
  )

  const renderContent = () => {
    if (isLoading && loadingState) {
      return loadingState
    }

    if (searchable && searchValue && filteredItems.length === 0) {
      return searchEmptyState || <DefaultSearchEmptyState searchValue={searchValue} onClear={() => handleSearch("")} />
    }

    if (!isLoading && items.length === 0 && emptyState) {
      return emptyState
    }

    return (
      <div className={gridClassName}>
        {filteredItems.map((item, index) => (
          <div key={index} className='h-full'>
            {renderCard(item, index)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`${containerClassName}`}>
      <div className={`h-full overflow-auto ${className}`}>
        {searchable && (
          <div className='sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 px-4'>
            {renderHeader ? (
              renderHeader({
                value: searchValue,
                onChange: handleSearch,
                placeholder: searchPlaceholder,
              })
            ) : (
              <SearchInput
                value={searchValue}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                className='w-full max-w-sm'
              />
            )}
          </div>
        )}
        <ScrollShadow>{renderContent()}</ScrollShadow>
      </div>
    </div>
  )
}

export default CardGallery