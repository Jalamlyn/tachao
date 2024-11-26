import React, { useState } from "react"
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"
import CardGallery from "@/components/CardGallery"
import EmptyState from "@/components/EmptyState"
import ConfirmModal from "@/components/ConfirmModal"
import ShareModal from "@/components/ShareModal"
import RenameModal from "@/components/RenameModal"
import { useMetadata } from "@/hooks/metadata"

interface Template {
  id: string
  title: string
  status: string
  updatedAt: string
}

interface TemplateGalleryProps {
  onTemplateSelect: (templateId: string) => void
  className?: string
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onTemplateSelect, className }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [internalTemplates, setInternalTemplates] = useState<Template[]>([])
  const { remove, load, update } = useMetadata("template")
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const result = await load()
      if (result) {
        setInternalTemplates(result)
      }
    } catch (error) {
      console.error("加载模板列表失败:", error)
      message.error("加载模板列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadTemplates()
  }, [])

  const handleDeleteConfirm = async () => {
    if (selectedTemplate) {
      try {
        await remove(selectedTemplate.id)
        onClose()
        await loadTemplates()
      } catch (error) {
        console.error("删除模板失败:", error)
        message.error("删除模板失败")
      }
    }
  }

  const handleDeleteClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    onOpen()
  }

  const handleShareClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    onShareOpen()
  }

  const handleAIEditClick = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/we-chat-app/admin/documents/edit/${template.id}`, { state: { title: template.title } })
  }

  const handleRenameClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    setIsRenameModalOpen(true)
  }

  const handleRename = async (newTitle: string) => {
    if (!selectedTemplate) return

    try {
      await update(selectedTemplate.id, {
        title: newTitle,
      })
      await loadTemplates()
    } catch (error) {
      console.error("重命名模板失败:", error)
      throw error
    }
  }

  const renderCard = (template: Template) => (
    <Card isPressable isHoverable className='w-full h-[240px] group' onPress={() => onTemplateSelect(template.id)}>
      <CardBody className='p-0 relative overflow-hidden'>
        <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 group-hover:scale-105 transition-transform duration-300'>
          <Icon
            icon='fluent:document-add-48-regular'
            className='w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform duration-300'
          />
        </div>
      </CardBody>
      <CardFooter className='flex flex-col gap-3 px-4 py-3 bg-white'>
        <div className='flex justify-between items-center w-full'>
          <h4
            className='text-lg font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors duration-300'
            title={template.title}
          >
            {template.title}
          </h4>
        </div>
        <div className='flex justify-between items-center w-full'>
          <div className='flex gap-2'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleShareClick(template, e)}
            >
              <Icon icon='mdi:share' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleRenameClick(template, e)}
            >
              <Icon icon='mdi:pencil' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-300'
              onClick={(e) => handleAIEditClick(template, e)}
            >
              <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-danger hover:bg-danger-50 transition-colors duration-300'
              onClick={(e) => handleDeleteClick(template, e)}
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
        items={internalTemplates}
        renderCard={renderCard}
        emptyState={
          <EmptyState
            type="no-data"
            title="还没有表单模板"
            description="创建你的第一个表单模板，AI 助手会帮助你快速生成专业的表单"
            action={{
              text: "去创建",
              onClick: () => navigate("/we-chat-app/admin/documents/create")
            }}
          />
        }
        loadingState={loadingState}
        isLoading={isLoading}
        containerClassName='h-[calc(100vh-200px)]'
        className={className}
        searchable
        searchFields={["title"]}
        searchPlaceholder='搜索模板...'
        onSearch={setSearchValue}
        customSearch={(template, value) => template.title.toLowerCase().includes(value.toLowerCase())}
      />

      <ConfirmModal
        type="delete"
        isOpen={isOpen}
        onClose={onClose}
        content={`确定要删除模板 "${selectedTemplate?.title}" 吗？此操作不可撤销。`}
        onConfirm={handleDeleteConfirm}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={onShareClose}
        shareUrl={`${window.location.origin}/form-preview/${selectedTemplate?.id || ""}`}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
          setSelectedTemplate(null)
        }}
        initialName={selectedTemplate?.title || ""}
        onRename={handleRename}
      />
    </>
  )
}

export default TemplateGallery