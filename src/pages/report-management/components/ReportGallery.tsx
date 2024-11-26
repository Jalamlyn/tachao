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
import { useMetadata } from "@/hooks/useMetadata"

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

  const renderCard = (report: Report) => (
    <Card isPressable isHoverable className='w-full h-[240px] group' onPress={() => onReportSelect(report.id)}>
      <CardBody className='p-0 relative overflow-hidden'>
        <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50 group-hover:scale-105 transition-transform duration-300'>
          <Icon
            icon='mdi:file-chart'
            className='w-16 h-16 text-red-400 group-hover:scale-110 transition-transform duration-300'
          />
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
    </>
  )
}

export default ReportGallery