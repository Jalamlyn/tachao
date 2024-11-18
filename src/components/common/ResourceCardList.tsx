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
            className='grid grid-cols-1 gap-2'
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants} layout>
                <div className='flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow'>
                  <div className='text-sm font-medium text-gray-700 truncate flex-1'>
                    {item.title || item.name || item.id}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      size='sm'
                      isIconOnly
                      variant='light'
                      className='min-w-0 w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600'
                      onClick={() => onView(item.id)}
                    >
                      <Icon icon='mdi:eye' className='w-3.5 h-3.5' />
                    </Button>
                    <Button
                      size='sm'
                      isIconOnly
                      variant='light'
                      className='min-w-0 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600'
                      onClick={() => handleDelete(item.id)}
                      isLoading={internalDeletingId === item.id || externalDeletingId === item.id}
                    >
                      <Icon icon='mdi:delete' className='w-3.5 h-3.5' />
                    </Button>
                  </div>
                </div>
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
