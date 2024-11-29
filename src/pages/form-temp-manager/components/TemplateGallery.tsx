import React, { useState, useCallback } from "react"
import { useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"
import CardGallery from "@/components/CardGallery"
import ConfirmModal from "@/components/ConfirmModal"
import ShareModal from "@/components/ShareModal"
import RenameModal from "@/components/RenameModal"
import TagManageModal from "@/components/TagManageModal"
import { useMetadata } from "@/hooks/metadata"
import { useTagManagement } from "@/hooks/useTagManagement"
import { useTagStore } from "@/stores/useTagStore"
import { getRenderCard } from "./getRenderCard"
import { getRenderEmptyState } from "./getRenderEmptyState"
import { EditTagsModal } from "./EditTagsModal"
import { getRenderHeader } from "./getRenderHeader"

export interface Template {
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
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isTagManageModalOpen, setIsTagManageModalOpen] = useState(false)
  const [isEditTagsModalOpen, setIsEditTagsModalOpen] = useState(false)

  const {
    tagsIndex,
    loading: tagsLoading,
    filterItemsByTags,
    getItemTags,
    loadTagsIndex,
    updateItemTags,
  } = useTagManagement("template")

  const tagsVersion = useTagStore((state) => state.tagsVersion)

  const { remove, load, update } = useMetadata("template")

  React.useEffect(() => {
    if (tagsVersion > 0) {
      loadTagsIndex()
    }
  }, [tagsVersion])

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

  const handleEditTagsClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    setIsEditTagsModalOpen(true)
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

  const handleClearTags = () => {
    setSelectedTags([])
  }

  const handleUpdateTags = async (templateId: string, tagIds: string[]) => {
    try {
      await updateItemTags(templateId, tagIds)
      await loadTemplates()
    } catch (error) {
      console.error("Error updating tags:", error)
      message.error("更新标签失败")
      throw error
    }
  }

  const filteredTemplates = React.useMemo(() => {
    if (!internalTemplates) return []

    let filtered = filterItemsByTags(internalTemplates, selectedTags)

    if (searchValue) {
      filtered = filtered.filter((template) => template.title.toLowerCase().includes(searchValue.toLowerCase()))
    }

    return filtered
  }, [internalTemplates, selectedTags, searchValue, filterItemsByTags])

  return (
    <>
      <CardGallery
        items={filteredTemplates}
        renderCard={getRenderCard(
          onTemplateSelect,
          tagsIndex,
          getItemTags,
          handleShareClick,
          handleRenameClick,
          handleAIEditClick,
          handleEditTagsClick,
          handleDeleteClick
        )}
        emptyState={getRenderEmptyState(selectedTags, tagsIndex, handleClearTags, navigate)()}
        loadingState={
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <Icon icon='eos-icons:loading' className='w-10 h-10 text-primary animate-spin' />
              <span className='text-default-500'>加载中...</span>
            </div>
          </div>
        }
        isLoading={isLoading || tagsLoading}
        containerClassName='h-[calc(100vh-200px)]'
        className={className}
        searchable
        searchFields={["title"]}
        searchPlaceholder='搜索模板名称...'
        onSearch={setSearchValue}
        renderHeader={getRenderHeader(
          setIsTagManageModalOpen,
          tagsIndex,
          selectedTags,
          setSelectedTags,
          handleClearTags,
          tagsVersion
        )}
      />

      <ConfirmModal
        type='delete'
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
        title='重命名模板'
        inputLabel='模板名称'
        inputPlaceholder='请输入新的模板名称'
      />

      <TagManageModal isOpen={isTagManageModalOpen} onClose={() => setIsTagManageModalOpen(false)} type='template' />

      <EditTagsModal
        isOpen={isEditTagsModalOpen}
        onClose={() => {
          setIsEditTagsModalOpen(false)
          setSelectedTemplate(null)
        }}
        template={selectedTemplate}
        tagsIndex={tagsIndex}
        onUpdateTags={handleUpdateTags}
      />
    </>
  )
}

export default TemplateGallery
