import React, { useState } from "react"
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import message from "@/components/Message"
import CardGallery from "@/components/CardGallery"
import { useMetadata } from "@/hooks/useMetadata"

interface Resource {
  id: string
  title: string
  status: string
  updatedAt: string
  indexFields: {
    size: number
    fileName: string
    type: string
  }
}

interface ResourceGalleryProps {
  onResourceSelect: (resourceId: string) => void
  className?: string
}

// 空状态组件
const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center min-h-[400px] p-8'
    >
      <div className='w-48 h-48 mb-8 relative'>
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Icon icon='mdi:file-excel' className='w-full h-full text-success/30' />
        </motion.div>
      </div>
      <h3 className='text-xl font-medium text-foreground mb-2'>还没有上传表格</h3>
      <p className='text-default-500 mb-8 text-center max-w-md'>上传你的第一个表格,开始使用 AI 进行数据分析</p>
    </motion.div>
  )
}

const ResourceGallery: React.FC<ResourceGalleryProps> = ({ onResourceSelect, className }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()
  const [selectedResource, setSelectedResource] = React.useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [internalResources, setInternalResources] = useState<Resource[]>([])
  const { remove, load } = useMetadata("resource")
  const [searchValue, setSearchValue] = useState("")

  const loadResources = async () => {
    try {
      setIsLoading(true)
      const result = await load()
      if (result) {
        setInternalResources(result)
      }
    } catch (error) {
      console.error("加载资料列表失败:", error)
      message.error("加载资料列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadResources()
  }, [])

  const handleDeleteConfirm = async () => {
    if (selectedResource) {
      try {
        await remove(selectedResource.id)
        onClose()
        await loadResources()
      } catch (error) {
        console.error("删除资料失败:", error)
        message.error("删除资料失败")
      }
    }
  }

  const handleDeleteClick = (resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedResource(resource)
    onOpen()
  }

  const renderCard = (resource: Resource) => (
    <Card isPressable isHoverable className='w-full h-[240px] group' onPress={() => onResourceSelect(resource.id)}>
      <CardBody className='p-0 relative overflow-hidden'>
        <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-success-100 to-success-50 group-hover:scale-105 transition-transform duration-300'>
          <Icon
            icon='mdi:file-excel'
            className='w-16 h-16 text-success-400 group-hover:scale-110 transition-transform duration-300'
          />
        </div>
      </CardBody>
      <CardFooter className='flex flex-col gap-3 px-4 py-3 bg-white'>
        <div className='flex justify-between items-center w-full'>
          <div className='flex flex-col'>
            <h4 className='text-lg font-medium text-foreground truncate max-w-[200px] group-hover:text-success-500 transition-colors duration-300'>
              {resource.title}
            </h4>
          </div>
        </div>
        <div className='flex justify-between items-center w-full'>
          <div className='flex gap-2'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-danger hover:bg-danger-50 transition-colors duration-300'
              onClick={(e) => handleDeleteClick(resource, e)}
            >
              <Icon icon='mdi:delete' className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )

  const loadingState = (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='flex flex-col items-center gap-4'>
        <Icon icon='eos-icons:loading' className='w-10 h-10 text-primary animate-spin' />
        <span className='text-default-500'>加载中...</span>
      </div>
    </div>
  )

  return (
    <>
      <CardGallery
        items={internalResources}
        renderCard={renderCard}
        emptyState={<EmptyState />}
        loadingState={loadingState}
        isLoading={isLoading}
        containerClassName='h-[calc(100vh-200px)]'
        className={className}
        searchable
        searchFields={["title", "indexFields.fileName"]}
        searchPlaceholder='搜索表格名称或文件名...'
        onSearch={setSearchValue}
        customSearch={(resource, value) =>
          resource.title.toLowerCase().includes(value.toLowerCase()) ||
          resource.indexFields.fileName.toLowerCase().includes(value.toLowerCase())
        }
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          base: "max-w-md",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <div className='flex items-center gap-2 text-danger'>
              <Icon icon='mdi:alert-circle' className='w-6 h-6' />
              <span>确认删除</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className='text-default-600'>确定要删除表格 "{selectedResource?.title}" 吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onClose}>
              取消
            </Button>
            <Button
              color='danger'
              onPress={handleDeleteConfirm}
              startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ResourceGallery
