import React, { useState } from "react"
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  useDisclosure,
  Chip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"
import CardGallery from "@/components/CardGallery"
import EmptyState from "@/components/EmptyState"
import ConfirmModal from "@/components/ConfirmModal"
import ShareModal from "@/components/ShareModal"
import RenameModal from "@/components/RenameModal"
import TagManageModal from "@/components/TagManageModal"
import EditTagsModal from "@/components/EditTagsModal"
import { useMetadata } from "@/hooks/useMetadata"
import { useTagManagement } from "@/hooks/useTagManagement"
import { useTagStore } from "@/stores/useTagStore"

interface Report {
  id: string
  title: string
  status: string
  updatedAt: string
}

interface ReportGalleryProps {
  onReportSelect: (reportId: string) => void
  onCreateReport?: () => void
  className?: string
}

const ReportGallery: React.FC<ReportGalleryProps> = ({ onReportSelect, onCreateReport, className }) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [internalReports, setInternalReports] = useState<Report[]>([])
  const { remove, load, update } = useMetadata("report")
  const { items: templates = [], load: loadTemplates } = useMetadata("template")
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
  } = useTagManagement("report")

  const tagsVersion = useTagStore((state) => state.tagsVersion)

  React.useEffect(() => {
    if (tagsVersion > 0) {
      loadTagsIndex()
    }
  }, [tagsVersion])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      const result = await load()
      if (result) {
        setInternalReports(result)
      }
    } catch (error) {
      console.error("加载报表列表失败:", error)
      message.error("加载报表列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadReports()
    loadTemplates()
  }, [])

  const handleDeleteConfirm = async () => {
    if (selectedReport) {
      try {
        await remove(selectedReport.id)
        onClose()
        await loadReports()
      } catch (error) {
        console.error("删除报表失败:", error)
        message.error("删除报表失败")
      }
    }
  }

  const handleDeleteClick = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedReport(report)
    onOpen()
  }

  const handleShareClick = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedReport(report)
    onShareOpen()
  }

  const handleAIAnalysisClick = async (report: Report, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/we-chat-app/admin/reports/ai/${report.id}`, {
      state: {
        title: report.title,
      },
    })
  }

  const handleRenameClick = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedReport(report)
    setIsRenameModalOpen(true)
  }

  const handleEditTagsClick = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedReport(report)
    setIsEditTagsModalOpen(true)
  }

  const handleDataManageClick = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/we-chat-app/admin/templates/${report.id}/data`, {
      state: {
        title: report.title,
        templateId: report.id,
      },
    })
  }

  const handleRename = async (newTitle: string) => {
    if (!selectedReport) return

    try {
      await update(selectedReport.id, {
        title: newTitle,
      })
      await loadReports()
    } catch (error) {
      console.error("重命名报表失败:", error)
      throw error
    }
  }

  const handleClearTags = () => {
    setSelectedTags([])
  }

  const handleUpdateTags = async (reportId: string, tagIds: string[]) => {
    try {
      await updateItemTags(reportId, tagIds)
      await loadReports()
    } catch (error) {
      console.error("Error updating tags:", error)
      message.error("更新标签失败")
      throw error
    }
  }

  const renderCard = (report: Report) => (
    <Card isPressable isHoverable className='w-full h-[240px] group' onPress={() => onReportSelect(report.id)}>
      <CardBody className='p-0 relative overflow-hidden'>
        <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50 group-hover:scale-105 transition-transform duration-300'>
          <Icon
            icon='mdi:file-chart'
            className='w-16 h-16 text-red-400 group-hover:scale-110 transition-transform duration-300'
          />
        </div>
        {/* 标签显示在右上角 */}
        <div className='absolute top-2 right-2 z-10 flex flex-wrap gap-1 max-w-[70%] justify-end'>
          {tagsIndex &&
            getItemTags(report.id).map((tag) => (
              <Chip
                key={tag.id}
                size='sm'
                color={tag.color as any}
                variant='flat'
                className='bg-background/60 backdrop-blur-sm'
              >
                {tag.name}
              </Chip>
            ))}
        </div>
      </CardBody>
      <CardFooter className='flex flex-col gap-3 px-4 py-3 bg-white'>
        <div className='flex justify-between items-center w-full'>
          <h4
            className='text-lg font-medium text-foreground truncate max-w-[200px] group-hover:text-red-500 transition-colors duration-300'
            title={report.title}
          >
            {report.title}
          </h4>
        </div>
        <div className='flex justify-between items-center w-full'>
          <div className='flex gap-2'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleShareClick(report, e)}
            >
              <Icon icon='mdi:share' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleRenameClick(report, e)}
            >
              <Icon icon='mdi:pencil' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-300'
              onClick={(e) => handleAIAnalysisClick(report, e)}
            >
              <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-primary hover:bg-primary-50 transition-colors duration-300'
              onClick={(e) => handleEditTagsClick(report, e)}
            >
              <Icon icon='mdi:tag-multiple' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-300'
              onClick={(e) => handleDataManageClick(report, e)}
              title="数据管理"
            >
              <Icon icon='mdi:database' className='w-4 h-4' />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              className='text-default-400 hover:text-danger hover:bg-danger-50 transition-colors duration-300'
              onClick={(e) => handleDeleteClick(report, e)}
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

  const hasTemplates = templates.length > 0

  const renderHeader = ({ value, onChange, placeholder }) => (
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
          {selectedTags.length > 0 && (
            <div className='absolute right-2 top-1.5 z-10'>
              <Button
                size='sm'
                variant='flat'
                color='default'
                onClick={handleClearTags}
                startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
              >
                清除筛选
              </Button>
            </div>
          )}
          <div className='flex flex-wrap items-center gap-2 min-h-[40px] p-2 rounded-lg bg-default-50'>
            {tagsIndex.tags
              .filter((tag) => tag.type === "report")
              .map((tag) => (
                <Chip
                  key={`${tag.id}-${tagsVersion}`}
                  startContent={selectedTags.includes(tag.id) && <Icon className='ml-2 w-5 h-5' icon='line-md:check-all' />}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                    )
                  }}
                  className={`cursor-pointer transition-transform hover:scale-105 bg-${tag.color}-500 text-white`}
                >
                  <div className='flex justify-center items-center'>
                    {tag.name}
                    <span className='ml-2 text-xs'>({tagsIndex.relations.report.byTag[tag.id]?.length || 0})</span>
                  </div>
                </Chip>
              ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <CardGallery
        items={internalReports}
        renderCard={renderCard}
        emptyState={
          <EmptyState
            type="no-data"
            title={hasTemplates ? "还没有报表" : "还没有可用的数据源"}
            description={
              hasTemplates 
                ? "选择一个表单模板开始创建你的第一个报表"
                : "创建报表前需要先创建表单模板作为数据源"
            }
            action={{
              text: hasTemplates ? "去创建" : "去创建模板",
              onClick: hasTemplates ? onCreateReport : () => navigate("/we-chat-app/admin/documents")
            }}
          />
        }
        loadingState={loadingState}
        isLoading={isLoading}
        containerClassName='h-[calc(100vh-200px)]'
        className={className}
        searchable
        searchFields={["title"]}
        searchPlaceholder='搜索报表名称...'
        onSearch={setSearchValue}
        customSearch={(report, value) => report.title.toLowerCase().includes(value.toLowerCase())}
        renderHeader={renderHeader}
      />

      <ConfirmModal
        type="delete"
        isOpen={isOpen}
        onClose={onClose}
        content={`确定要删除报表 "${selectedReport?.title}" 吗？此操作不可撤销。`}
        onConfirm={handleDeleteConfirm}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={onShareClose}
        shareUrl={`${window.location.origin}/report/${selectedReport?.id || ""}`}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
          setSelectedReport(null)
        }}
        initialName={selectedReport?.title || ""}
        onRename={handleRename}
        title="重命名报表"
        inputLabel="报表名称" 
        inputPlaceholder="请输入新的报表名称"
      />

      <TagManageModal
        isOpen={isTagManageModalOpen}
        onClose={() => setIsTagManageModalOpen(false)}
        type="report"
      />

      <EditTagsModal
        isOpen={isEditTagsModalOpen}
        onClose={() => {
          setIsEditTagsModalOpen(false)
          setSelectedReport(null)
        }}
        item={selectedReport}
        type="report"
        tagsIndex={tagsIndex}
        onUpdateTags={handleUpdateTags}
      />
    </>
  )
}

export default ReportGallery