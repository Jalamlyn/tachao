import React, { useState } from "react"
import { useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"
import CardGallery from "@/components/CardGallery"
import ConfirmModal from "@/components/ConfirmModal"
import ShareModal from "@/components/ShareModal"
import RenameModal from "@/components/RenameModal"
import TagManageModal from "@/components/TagManageModal"
import EditTagsModal from "@/components/EditTagsModal"
import { PermissionModal } from "@/permissions/components/PermissionModal"
import { useMetadata } from "@/hooks/useMetadata"
import { useTagManagement } from "@/hooks/useTagManagement"
import { useTagStore } from "@/stores/useTagStore"
import { renderHeader } from "./render/renderHeader"
import { renderCard } from "./render/renderCard"
import { renderEmptyState } from "./render/renderEmptyState"

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
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)

  const {
    tagsIndex,
    loading: tagsLoading,
    filterItemsByTags,
    getItemTags,
    loadTagsIndex,
    updateItemTags,
  } = useTagManagement("template")

  const tagsVersion = useTagStore((state) => state.tagsVersion)

  React.useEffect(() => {
    if (tagsVersion > 0) {
      loadTagsIndex()
    }
  }, [tagsVersion])

  const { remove, load, update } = useMetadata("template")

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
    setSelectedTemplate(template)
    onOpen()
  }

  const handleShareClick = (template: Template, e: React.MouseEvent) => {
    setSelectedTemplate(template)
    onShareOpen()
  }

  const handleAIEditClick = async (template: Template, e: React.MouseEvent) => {
    navigate(`/we-chat-app/admin/documents/edit/${template.id}`, { state: { title: template.title } })
  }

  const handleRenameClick = (template: Template, e: React.MouseEvent) => {
    setSelectedTemplate(template)
    setIsRenameModalOpen(true)
  }

  const handleEditTagsClick = (template: Template, e: React.MouseEvent) => {
    setSelectedTemplate(template)
    setIsEditTagsModalOpen(true)
  }

  const handlePermissionsClick = (template: Template, e: React.MouseEvent) => {
    setSelectedTemplate(template)
    setIsPermissionModalOpen(true)
  }

  const handleDataManageClick = (template: Template, e: React.MouseEvent) => {
    navigate(`/we-chat-app/admin/documents/data/${template.id}`, { state: { title: template.title } })
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

  // 使用 useMemo 优化过滤后的模板列表
  const filteredTemplates = React.useMemo(() => {
    if (!internalTemplates) return []

    let templates = [...internalTemplates]

    // 应用标签筛选
    if (selectedTags.length > 0 && tagsIndex) {
      templates = filterItemsByTags(templates, selectedTags)
    }

    // 应用搜索筛选
    if (searchValue) {
      templates = templates.filter((template) => template.title.toLowerCase().includes(searchValue.toLowerCase()))
    }

    return templates
  }, [internalTemplates, selectedTags, searchValue, filterItemsByTags, tagsIndex])

  const _renderCard = renderCard(
    onTemplateSelect,
    tagsIndex,
    getItemTags,
    handleRenameClick,
    handleAIEditClick,
    handleDataManageClick,
    handleShareClick,
    handleEditTagsClick,
    handleDeleteClick,
    handlePermissionsClick
  )

  const _renderEmptyState = renderEmptyState(selectedTags, tagsIndex, handleClearTags, navigate)

  const _renderHeader = renderHeader(
    setIsTagManageModalOpen,
    tagsIndex,
    selectedTags,
    handleClearTags,
    tagsVersion,
    setSelectedTags
  )

  return (
    <>
      <CardGallery
        items={filteredTemplates}
        renderCard={_renderCard}
        emptyState={_renderEmptyState()}
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
        customSearch={(template, value) => template.title.toLowerCase().includes(value.toLowerCase())}
        renderHeader={_renderHeader}
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
        shareUrl={`${window.location.origin}/form-create/${selectedTemplate?.id || ""}`}
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
        item={selectedTemplate}
        type='template'
        tagsIndex={tagsIndex}
        onUpdateTags={handleUpdateTags}
      />

      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false)
          setSelectedTemplate(null)
        }}
        resourceType='template'
        resourceId={selectedTemplate?.id || ""}
        resourceTitle={selectedTemplate?.title || ""}
      />
    </>
  )
}

export default TemplateGallery
