import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button, Card, CardHeader, CardBody, ScrollShadow, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CommandInput from "../components/CommandInput"
import { getAppId } from "@/utils"
import message from "@/components/Message"
import { getMetadata, deleteMetadata, setMetadata } from "@/service/apis/api"

const DataManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [currentContext, setCurrentContext] = useState<string>("单据")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [internalDeletingId, setInternalDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedAppId(getAppId())
  }, [])

  const handleViewItem = (id: string) => {
    if (!selectedAppId) return
    window.open(`/forms/${id}?appId=${selectedAppId}`, "_blank")
  }

  const handleDelete = async (id: string) => {
    if (!selectedAppId || !id) return

    setInternalDeletingId(id)
    try {
      await deleteMetadata({ name: `forms_${id}` })
      const updatedItems = items.filter((item) => item.id !== id)
      await setMetadata("forms", JSON.stringify(updatedItems), selectedAppId)
      message.success("删除成功")
      setItems(updatedItems)
    } catch (error) {
      console.error("Error deleting resource:", error)
      message.error("删除失败")
    } finally {
      setInternalDeletingId(null)
    }
  }

  const handleContextChange = (context: string) => {
    setCurrentContext(context)
    setItems([]) // 切换上下文时清空列表
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
    <Card className='w-full h-[calc(100vh-280px)] shadow-lg rounded-lg flex flex-col'>
      <CardHeader className='flex justify-between items-center p-4 text-white'>
        <div className='flex-1'>
          <CommandInput
            placeholder='输入您的数据管理需求...'
            disabled={isRefreshing}
            contexts={["单据", "数据"]}
            onContextChange={handleContextChange}
          />
          <div className='mt-2 text-sm text-white/70'>
            当前上下文: {currentContext}
          </div>
        </div>
      </CardHeader>
      <CardBody className='p-4 flex-grow flex flex-col'>
        {error ? (
          <div className='flex-grow flex items-center justify-center'>
            <p className='text-danger text-center'>{error}</p>
          </div>
        ) : (
          <ScrollShadow className='flex-grow mb-4 pr-2'>
            <AnimatePresence mode='wait'>
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex flex-col items-center justify-center h-full text-center p-8'
                >
                  <Icon icon='mdi:file-search-outline' className='w-16 h-16 text-gray-400 mb-4' />
                  <h3 className='text-xl font-semibold text-gray-700 mb-2'>暂无数据</h3>
                  <p className='text-gray-500'>
                    请在上方输入框中输入您的检索需求，
                    <br />
                    例如："查找本月的销售订单"
                  </p>
                </motion.div>
              ) : (
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
                            onClick={() => handleViewItem(item.id)}
                          >
                            <Icon icon='mdi:eye' className='w-3.5 h-3.5' />
                          </Button>
                          <Button
                            size='sm'
                            isIconOnly
                            variant='light'
                            className='min-w-0 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600'
                            onClick={() => handleDelete(item.id)}
                            isLoading={internalDeletingId === item.id}
                          >
                            <Icon icon='mdi:delete' className='w-3.5 h-3.5' />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollShadow>
        )}
      </CardBody>
    </Card>
  )
}

export default DataManagementPage