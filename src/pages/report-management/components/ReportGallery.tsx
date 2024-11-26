import React, { useEffect, useState } from "react"
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
import { motion, AnimatePresence } from "framer-motion"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import RenameModal from "./RenameModal"
import CardGallery from "@/components/CardGallery"

interface Report {
  id: string
  title: string
  status: string
  updatedAt: string
  indexFields?: {
    size?: number
    fileName?: string
  }
}

interface ReportGalleryProps {
  reports?: Report[]
  onReportSelect: (reportId: string) => void
  onCreateReport?: () => void
  className?: string
}

// 空状态类型定义
type EmptyState = {
  type: "no-template" | "no-report"
  title: string
  description: string
  action: {
    text: string
    href: string
  }
}

// 空状态组件
const EmptyState: React.FC<{
  state: EmptyState
  onCreateReport?: () => void
}> = ({ state, onCreateReport }) => {
  const navigate = useNavigate()

  const handleAction = () => {
    if (state.type === "no-template") {
      navigate(state.action.href)
    } else {
      onCreateReport?.()
    }
  }

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
          <Icon
            icon={state.type === "no-template" ? "fluent:document-add-48-regular" : "mdi:file-chart"}
            className='w-full h-full text-primary/30'
          />
        </motion.div>
      </div>
      <h3 className='text-xl font-medium text-foreground mb-2'>{state.title}</h3>
      <p className='text-default-500 mb-8 text-center max-w-md'>{state.description}</p>
      <Button color='secondary' size='lg' onClick={handleAction}>
        {state.action.text}
      </Button>
    </motion.div>
  )
}

// 获取空状态配置
const getEmptyState = (hasTemplates: boolean): EmptyState => {
  if (!hasTemplates) {
    return {
      type: "no-template",
      title: "还没有可用的数据源",
      description: "创建报表前需要先创建表单模板作为数据源",
      action: {
        text: "去创建模板",
        href: "/we-chat-app/admin/documents",
      },
    }
  }

  return {
    type: "no-report",
    title: "还没有报表",
    description: "选择一个表单模板开始创建你的第一个报表",
    action: {
      text: "去创建",
      href: "#",
    },
  }
}

const ReportGallery: React.FC<ReportGalleryProps> = ({
  reports: propReports,
  onReportSelect,
  onCreateReport,
  className,
}) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure()
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [internalReports, setInternalReports] = useState<Report[]>([])
  const { remove, load, update } = useMetadata("report")
  const { items: templates = [], load: loadTemplates } = useMetadata("template")
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)

  const reports = internalReports.length > 0 ? internalReports : propReports || []

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

  useEffect(() => {
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

  const handleCopyShareLink = async () => {
    if (selectedReport) {
      const shareLink = `${window.location.origin}/report/${selectedReport.id}`
      try {
        await navigator.clipboard.writeText(shareLink)
        onShareClose()
      } catch (error) {
        console.error("复制链接失败:", error)
        message.error("复制链接失败")
      }
    }
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
        <div className='w-full h-[160px] flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50 group-hover:scale-105 transition-transform duration-300'>
          <Icon
            icon='mdi:file-chart'
            className='w-16 h-16 text-green-400 group-hover:scale-110 transition-transform duration-300'
          />
        </div>
      </CardBody>
      <CardFooter className='flex flex-col gap-3 px-4 py-3 bg-white'>
        <div className='flex justify-between items-center w-full'>
          <h4
            className='text-lg font-medium text-foreground truncate max-w-[200px] group-hover:text-green-500 transition-colors duration-300'
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
              className='text-default-400 hover:text-green-500 hover:bg-green-50 transition-colors duration-300'
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

  return (
    <>
      <CardGallery
        items={reports}
        renderCard={renderCard}
        emptyState={<EmptyState state={getEmptyState(templates.length > 0)} onCreateReport={onCreateReport} />}
        loadingState={loadingState}
        isLoading={isLoading}
        containerClassName="h-[calc(100vh-200px)]"
        className={className}
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
            <p className='text-default-600'>确定要删除报表 "{selectedReport?.title}" 吗？此操作不可撤销。</p>
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

      <Modal
        isOpen={isShareOpen}
        onClose={onShareClose}
        classNames={{
          base: "max-w-md",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>分享报表</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              <p className='text-default-600'>复制以下链接分享报表：</p>
              <Input
                readOnly
                value={`${window.location.origin}/report/${selectedReport?.id || ""}`}
                classNames={{
                  input: "bg-default-50",
                  inputWrapper: "bg-default-50 hover:bg-default-100",
                }}
                endContent={
                  <Button size='sm' variant='light' className='min-w-unit-16 h-unit-8' onClick={handleCopyShareLink}>
                    <Icon icon='mdi:content-copy' className='w-4 h-4' />
                  </Button>
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onShareClose} startContent={<Icon icon='mdi:check' className='w-4 h-4' />}>
              完成
            </Button>
          </Modal</ModalContent>
      </Modal>

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
          setSelectedReport(null)
        }}
        onRename={handleRename}
        initialTitle={selectedReport?.title || ""}
      />
    </>
  )
}

export default ReportGallery