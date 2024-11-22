import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { useMetadata } from "@/hooks/useMetadata"
import PageLayout from "@/components/PageLayout"
import ReportGallery from "./components/ReportGallery"
import message from "@/components/Message"
import { useFormCount } from "@/hooks/useFormCount"
import { GuideModal } from "@/components/GuideModal"
import { TemplateSelect } from "@/components/TemplateSelect"

const ReportManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [templates, setTemplates] = useState<Array<{ id: string; title: string }>>([])
  const [loading, setLoading] = useState(false)

  const { load: loadTemplates } = useMetadata("template")
  const { getFormCountByTemplate } = useFormCount()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/Reports" },
    ])
  }, [])

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const result = await loadTemplates()
        if (result) {
          setTemplates(
            result.map((item) => ({
              id: item.id,
              key: item.id,
              title: item.title,
              label: item.title,
            }))
          )
        }
      } catch (error) {
        console.error("Error loading templates:", error)
        message.error("加载模板列表失败")
      }
    }
    fetchTemplates()
  }, [loadTemplates])

  const handleReportSelect = (reportId: string) => {
    window.open(`/report/${reportId}`, "_blank")
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
    setSelectedTemplates([])
  }

  const handleTemplateSelect = (value: string[]) => {
    setSelectedTemplates(value)
  }

  const handleCreateConfirm = async () => {
    if (selectedTemplates.length === 0) {
      message.error("请至少选择一个数据源")
      return
    }

    // 兼容单模板和多模板场景
    const templateId = selectedTemplates[0]
    const formCount = getFormCountByTemplate(templateId)

    if (formCount < 10) {
      setShowGuideModal(true)
      return
    }

    setLoading(true)
    try {
      if (selectedTemplates.length === 1) {
        // 单模板场景 - 保持原有路由格式
        navigate(`/we-chat-app/admin/reports/ai/create/${templateId}`)
      } else {
        // 多模板场景 - 使用查询参数
        const templateIds = selectedTemplates.join(',')
        navigate(`/we-chat-app/admin/reports/ai/create?templateIds=${templateIds}`)
      }
      handleCreateModalClose()
    } catch (error) {
      console.error("Error creating report:", error)
      message.error("创建报表失败")
    } finally {
      setLoading(false)
    }
  }

  const pageActions = (
    <Button color='primary' startContent={<Icon icon='mdi:plus' />} onClick={handleCreateClick}>
      创建报表
    </Button>
  )

  return (
    <PageLayout title='报表管理' titleIcon='mdi:file-chart' actions={pageActions}>
      <ReportGallery
        onReportSelect={handleReportSelect}
        onCreateReport={handleCreateClick}
        className='transition-all duration-300'
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        placement='center'
        classNames={{
          base: "max-w-md",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>选择数据源</ModalHeader>
          <ModalBody>
            <TemplateSelect 
              templates={templates} 
              value={selectedTemplates} 
              onChange={handleTemplateSelect}
              multiple={true} // 启用多选
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={handleCreateModalClose}>
              取消
            </Button>
            <Button color='primary' onPress={handleCreateConfirm} isLoading={loading}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <GuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        formCount={getFormCountByTemplate(selectedTemplates[0])}
        templateId={selectedTemplates[0]}
      />
    </PageLayout>
  )
}

export default ReportManagement