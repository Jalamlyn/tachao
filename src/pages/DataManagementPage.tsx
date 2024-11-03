import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button, Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import CommandInput from "@/components/CommandInput"
import { useFormSubmission } from "@/components/from-templates/hook/useFormSubmission"
import message from "@/components/Message"
import { getAppId } from "@/utils"
import { getMetadata, deleteMetadata, setMetadata } from "@/service/apis/api"
import ResourceCardList from "@/components/common/ResourceCardList"
import CreateResourceButton from "@/components/resource/CreateResourceButton"

const DataManagementPage: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [currentContext, setCurrentContext] = useState<string>("单据")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [internalDeletingId, setInternalDeletingId] = useState<string | null>(null)
  const [hasResources, setHasResources] = useState(false)

  useEffect(() => {
    setSelectedAppId(getAppId())
  }, [])

  useEffect(() => {
    if (selectedAppId) {
      checkResources()
    }
  }, [selectedAppId])

  const checkResources = async () => {
    try {
      const response = await getMetadata(["resources"], selectedAppId)
      if (response.data && response.data.length > 0 && response.data[0].value) {
        const data = JSON.parse(response.data[0].value)
        setHasResources(data.length > 0)
      } else {
        setHasResources(false)
      }
    } catch (error) {
      console.error("Error checking resources:", error)
      setHasResources(false)
    }
  }

  const handleViewItem = (id: string) => {
    if (!selectedAppId) return
    window.open(`/resources/view/${id}?appId=${selectedAppId}`, "_blank")
  }

  const handleDelete = async (id: string) => {
    if (!selectedAppId || !id) return

    setInternalDeletingId(id)
    try {
      await deleteMetadata({ name: `resources_${id}` })
      const updatedItems = items.filter((item) => item.id !== id)
      await setMetadata("resources", JSON.stringify(updatedItems), selectedAppId)
      message.success("删除成功")
      setItems(updatedItems)
      checkResources()
    } catch (error) {
      console.error("Error deleting resource:", error)
      message.error("删除失败")
    } finally {
      setInternalDeletingId(null)
    }
  }

  const handleContextChange = (context: string) => {
    setCurrentContext(context)
    setItems([])
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
    <Card className='w-full h-[calc(100vh-16px)] shadow-lg rounded-lg flex flex-col'>
      <CardBody className='p-4 flex-grow flex flex-col'>
        {!hasResources ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center flex-grow gap-6'
          >
            <div className='text-center space-y-4'>
              <Icon icon='mdi:file-upload-outline' className='w-20 h-20 text-gray-400 mx-auto' />
              <h2 className='text-2xl font-semibold text-gray-700'>开始创建您的第一份资料</h2>
              <p className='text-gray-500 max-w-md'>
                上传Excel文件来创建资料，支持单表头和多表头格式。您可以随时添加、编辑和管理这些资料。
              </p>
            </div>
            <CreateResourceButton
              appId={selectedAppId}
              isDisabled={!selectedAppId}
            />
          </motion.div>
        ) : (
          <ResourceCardList
            resourceType='resources'
            appId={selectedAppId}
            onView={handleViewItem}
            onDelete={handleDelete}
            onCreate={() => {}}
            isRefreshing={isRefreshing}
            setIsRefreshing={setIsRefreshing}
            deletingId={internalDeletingId}
            createButton={
              <CreateResourceButton
                appId={selectedAppId}
                isDisabled={!selectedAppId}
              />
            }
          />
        )}
      </CardBody>
    </Card>
  )
}

export default DataManagementPage