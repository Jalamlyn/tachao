import React, { useState } from "react"
import { Card, CardBody, CardFooter, Button, useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"
import CardGallery from "@/components/CardGallery"
import EmptyState from "@/components/EmptyState"
import ConfirmModal from "@/components/ConfirmModal"
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

const ResourceGallery: React.FC<ResourceGalleryProps> = ({ onResourceSelect, className }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
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
        emptyState={
          <EmptyState type='no-data' title='还没有上传 Excel' description='上传你的第一个表格,开始使用 AI 进行数据分析' />
        }
        loadingState={loadingState}
        isLoading={isLoading}
        containerClassName='h-[calc(100vh-200px)]'
        className={className}
        searchable
        searchFields={["title", "indexFields.fileName"]}
        searchPlaceholder='搜索资料名称...'
        onSearch={setSearchValue}
        customSearch={(resource, value) =>
          resource.title.toLowerCase().includes(value.toLowerCase()) ||
          resource.indexFields.fileName.toLowerCase().includes(value.toLowerCase())
        }
      />

      <ConfirmModal
        type='delete'
        isOpen={isOpen}
        onClose={onClose}
        content={`确定要删除表格 "${selectedResource?.title}" 吗？此操作不可撤销。`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}

export default ResourceGallery
