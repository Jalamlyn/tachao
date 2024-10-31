import React, { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardBody, Button, ScrollShadow } from "@nextui-org/react"
import { getMetadata, deleteMetadata, setMetadata } from "@/service/apis/api"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import DeleteConfirmModal from "../forms/DeleteConfirmModal"
import message from "../Message"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"

interface ResourceCardListProps {
  resourceType: "forms" | "reports" | "resources"
  appId: string | null
  onView: (id: string) => void
  onDelete?: (id: string) => void
  onCreate: () => void
  isRefreshing?: boolean
  setIsRefreshing?: (value: boolean) => void
  deletingId?: string | null
  createButton?: React.ReactNode
}

const ResourceCardList: React.FC<ResourceCardListProps> = ({
  resourceType,
  appId,
  onView,
  onCreate,
  isRefreshing = false,
  setIsRefreshing,
  deletingId: externalDeletingId,
  createButton,
}) => {
  const [items, setItems] = useState<any[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [internalDeletingId, setInternalDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const { copyForm } = useFormMetadata()

  const fetchItems = useCallback(async () => {
    if (!appId) return
    try {
      const response = await getMetadata([resourceType], appId)
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const data = JSON.parse(response.data[0].value)
        setItems(data)
      }
    } catch (error) {
      console.error(`Error fetching ${resourceType}:`, error)
      setError(`获取${resourceType}失败`)
    } finally {
      if (setIsRefreshing) {
        setIsRefreshing(false)
      }
    }
  }, [appId, resourceType, setIsRefreshing])

  useEffect(() => {
    if (appId) {
      fetchItems()
    }
  }, [appId, fetchItems])

  useEffect(() => {
    if (isRefreshing) {
      fetchItems()
    }
  }, [isRefreshing, fetchItems])

  const handleDelete = async (id: string) => {
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !appId) return

    setInternalDeletingId(itemToDelete)
    try {
      await deleteMetadata({ name: `${resourceType}_${itemToDelete}` })
      const updatedItems = items.filter((item) => item.id !== itemToDelete)
      await setMetadata(resourceType, JSON.stringify(updatedItems), appId)
      message.success("删除成功")
      await fetchItems()
    } catch (error) {
      console.error("Error deleting resource:", error)
      message.error("删除失败")
    } finally {
      setInternalDeletingId(null)
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
    }
  }

  const handleCopy = async (item: any) => {
    if (!appId) return
    setIsCopying(true)
    try {
      await copyForm(item.id, {
        resetStatus: true,
        resetDates: true,
        suffix: '_副本',
        onBeforeCopy: async (form) => {
          // 可以在这里添加自定义的复制前处理逻辑
          return form
        }
      })
      message.success("复制成功")
      await fetchItems()
    } catch (error) {
      console.error("Error copying form:", error)
      message.error("复制失败")
    } finally {
      setIsCopying(false)
    }
  }

  const handleRefresh = () => {
    if (setIsRefreshing) {
      setIsRefreshing(true)
    }
  }

  const getResourceTypeLabel = () => {
    switch (resourceType) {
      case "forms":
        return "单据"
      case "reports":
        return "报表"
      case "resources":
        return "资料"
      default:
        return "资源"
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <>
      <div className='flex sm:flex-row gap-2 sm:gap-3 mb-4'>
        {createButton ? (
          createButton
        ) : (
          <Button
            color='primary'
            onClick={onCreate}
            startContent={<Icon icon='mdi:plus' className='w-4 h-4' />}
            className='w-full sm:w-auto min-w-[160px] bg-gradient-to-r from-blue-600 to-blue-700 shadow hover:shadow-md transition-all duration-300'
            size='sm'
            isDisabled={!appId}
          >
            创建{getResourceTypeLabel()}
          </Button>
        )}
        <Button
          color='default'
          onClick={handleRefresh}
          startContent={<Icon icon='mdi:refresh' className='w-4 h-4' />}
          className='w-full sm:w-auto min-w-[100px] bg-white hover:bg-gray-50 shadow hover:shadow-md transition-all duration-300'
          size='sm'
          isDisabled={!appId || isRefreshing}
        ></Button>
      </div>

      <ScrollShadow className='h-[calc(100vh-320px)] p-2'>
        <AnimatePresence mode='wait'>
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3'
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants} layout className='h-full'>
                <Card className='group h-full hover:shadow-md transition-all duration-300 bg-white border border-gray-100'>
                  <CardHeader className='flex flex-col items-start space-y-1 bg-gradient-to-r from-gray-50 to-white p-2 sm:p-3'>
                    <h4 className='text-base font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2'>
                      {item.title || item.name}
                    </h4>
                  </CardHeader>
                  <CardBody className='p-2'>
                    <div className='flex items-center gap-2'>
                      <Button
                        size='sm'
                        color='primary'
                        variant='light'
                        onClick={() => onView(item.id)}
                        startContent={<Icon icon='mdi:eye' className='w-3.5 h-3.5' />}
                        className='flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-300 min-w-0 px-2'
                      ></Button>
                      <Button
                        size='sm'
                        color='secondary'
                        variant='light'
                        onClick={() => handleCopy(item)}
                        startContent={<Icon icon='mdi:content-copy' className='w-3.5 h-3.5' />}
                        isLoading={isCopying}
                        className='flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors duration-300 min-w-0 px-2'
                      ></Button>
                      <Button
                        size='sm'
                        color='danger'
                        variant='light'
                        onClick={() => handleDelete(item.id)}
                        startContent={<Icon icon='mdi:delete' className='w-3.5 h-3.5' />}
                        isLoading={internalDeletingId === item.id || externalDeletingId === item.id}
                        className='flex-1 bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-300 min-w-0 px-2'
                      ></Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </ScrollShadow>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={internalDeletingId !== null}
      />
    </>
  )
}

export default ResourceCardList