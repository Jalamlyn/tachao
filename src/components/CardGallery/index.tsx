import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardBody, CardFooter } from "@nextui-org/react"

export interface CardGalleryProps<T> {
  items: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  emptyState?: React.ReactNode
  className?: string
  containerClassName?: string 
  loadingState?: React.ReactNode
  isLoading?: boolean
  gridClassName?: string
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
}: CardGalleryProps<T>) {
  // 处理加载状态
  if (isLoading && loadingState) {
    return loadingState
  }

  // 处理空状态
  if (!isLoading && (!items || items.length === 0) && emptyState) {
    return emptyState
  }

  return (
    <div className={`h-full overflow-hidden ${containerClassName}`}>
      <div className={`h-full overflow-auto ${className}`}>
        <div className={gridClassName}>
          <AnimatePresence>
            {items.map((item, index) => (
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