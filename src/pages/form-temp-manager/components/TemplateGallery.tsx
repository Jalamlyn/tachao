import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardBody, CardFooter, Button, useDisclosure, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import message from "@/components/Message"
import CardGallery from "@/components/CardGallery"
import EmptyState from "@/components/EmptyState"
import ConfirmModal from "@/components/ConfirmModal"
import ShareModal from "@/components/ShareModal"
import RenameModal from "@/components/RenameModal"
import TagManageModal from "@/components/TagManageModal"
import { useMetadata } from "@/hooks/metadata"
import { useTagManagement } from "@/hooks/useTagManagement"
import { useTagStore } from "@/stores/useTagStore"

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
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isTagManageModalOpen, setIsTagManageModalOpen] = useState(false)

  const {
    tagsIndex,
    loading: tagsLoading,
    filterItemsByTags,
    getItemTags,
    loadTagsIndex,
  } = useTagManagement("template")

  const tagsVersion = useTagStore((state) => state.tagsVersion)

  const { remove, load, update } = useMetadata("template")

  useEffect(() => {
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

  const filteredTemplates = useMemo(() => {
    if (!internalTemplates) return []

    let filtered = filterItemsByTags(internalTemplates, selectedTags)

    if (searchValue) {
      filtered = filtered.filter((template) => template.title.toLowerCase().includes(searchValue.toLowerCase()))
    }

    return filtered
  }, [internalTemplates, selectedTags, searchValue, filterItemsByTags])

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
        {tagsIndex && (
          <div className='flex flex-wrap gap-1 mt-2'>
            {getItemTags(template.id).map((tag) => (
              <Chip key={tag.id} size='sm' color={tag.color as any} variant='flat'>
                {tag.name}
              </Chip>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  )

  const renderHeader = useCallback(
    ({ value, onChange, placeholder }) => (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <input
              type='text'
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className='w-full max-w-sm px-3 py-2 rounded-lg border border-default-200 focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>
          <Button
            color='primary'
            variant='flat'
            onClick={() => setIsTagManageModalOpen(true)}
            startContent={<Icon icon='mdi:tag-plus' />}
          >
            管理标签
          </Button>
        </div>

        {tagsIndex && (
          <div className='relative'>
            <AnimatePresence>
              {selectedTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className='absolute right-2 top-1.5 z-10'
                >
                  <Button
                    size='sm'
                    variant='flat'
                    color='default'
                    onClick={handleClearTags}
                    startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                  >
                    清除筛选
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className='flex flex-wrap items-center gap-2 min-h-[40px] p-2 rounded-lg bg-default-50'>
              {tagsIndex.tags
                .filter((tag) => tag.type === "template")
                .map((tag) => (
                  <motion.div
                    key={tag.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Chip
                      color={tag.color as any}
                      variant={selectedTags.includes(tag.id) ? "solid" : "bordered"}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                        )
                      }}
                      className='cursor-pointer transition-transform hover:scale-105'
                      classNames={{
                        base: "transition-all duration-200",
                        content: "transition-colors duration-200",
                      }}
                    >
                      {tag.name}
                      <span className='ml-2 text-xs'>({tagsIndex.relations.template.byTag[tag.id]?.length || 0})</span>
                    </Chip>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>
    ),
    [selectedTags, tagsIndex]
  )

  const renderEmptyState = () => {
    if (selectedTags.length > 0) {
      const tagNames = selectedTags
        .map((tagId) => tagsIndex?.tags.find((tag) => tag.id === tagId)?.name)
        .filter(Boolean)
        .join("、")

      return (
        <EmptyState
          type='no-data'
          title={`未找到匹配的表单模板`}
          description={
            <div className='space-y-2'>
              <p>当前筛选标签：{tagNames}</p>
              <Button color='primary' variant='flat' onClick={handleClearTags}>
                清除筛选
              </Button>
            </div>
          }
          icon={<Icon icon='mdi:filter-off' className='w-32 h-32 text-default-600' />}
        />
      )
    }

    return (
      <EmptyState
        type='no-data'
        title='还没有表单模板'
        description='创建你的第一个表单模板，AI 助手会帮助你快速生成专业的表单'
        action={{
          text: "去创建",
          onClick: () => navigate("/we-chat-app/admin/documents/create"),
        }}
      />
    )
  }

  return (
    <>
      <CardGallery
        items={filteredTemplates}
        renderCard={renderCard}
        emptyState={renderEmptyState()}
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
        renderHeader={renderHeader}
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
    </>
  )
}

export default TemplateGallery
