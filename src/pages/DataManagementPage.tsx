import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button, Card, CardHeader, CardBody, ScrollShadow, Spinner, Tooltip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CommandInput from "../components/CommandInput"
import { getAppId } from "@/utils"
import message from "@/components/Message"
import { getMetadata, deleteMetadata, setMetadata } from "@/service/apis/api"
import { useFormMetadata } from "@/components/from-templates/hook/useFormMetadata"
import AIFormAgent from "@/service/agents/AIFormAgent"
import ResourceCardList from "@/components/common/ResourceCardList"

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
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const { addForm } = useFormMetadata()

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

  return (
    <Card className='w-full h-[calc(100vh-16px)] shadow-lg rounded-lg flex flex-col'>
      <CardHeader className='flex justify-between items-center p-4 text-white'>
        <div className='flex-1 space-y-4'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:magnify" className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-black">智能表单助手</h3>
              <Tooltip content="支持通过自然语言创建和检索表单">
                <Button isIconOnly variant="light" className="ml-2">
                  <Icon icon="mdi:help-circle-outline" className="w-5 h-5" />
                </Button>
              </Tooltip>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              您可以通过自然语言来创建或检索表单
            </p>
          </motion.div>

          <CommandInput
            placeholder='请输入您的需求，例如：创建一个请假单...'
            disabled={isProcessing}
            agent={AIFormAgent}
          />
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
              {searchResults.length > 0 ? (
                <ResourceCardList
                  resourceType="forms"
                  appId={selectedAppId}
                  onView={handleViewItem}
                  onDelete={handleDelete}
                  onCreate={() => {}}
                  isRefreshing={isRefreshing}
                  setIsRefreshing={setIsRefreshing}
                  deletingId={internalDeletingId}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex flex-col items-center justify-center h-full text-center p-8'
                >
                  <Icon icon='mdi:file-search-outline' className='w-16 h-16 text-gray-400 mb-4' />
                  <h3 className='text-xl font-semibold text-gray-700 mb-2'>开始使用</h3>
                  <p className='text-gray-500'>
                    请在上方输入框中输入您的需求，
                    <br />
                    例如："创建一个请假单" 或 "查找本月的销售订单"
                  </p>
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