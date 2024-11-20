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
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
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
          setTemplates(result.map(item => ({
            id: item.id,
            title: item.title
          })))
        }
      } catch (error) {
        console.error("Error loading templates:", error)
        message.error("加载模板列表失败")
      }
    }
    fetchTemplates()
  }, [loadTemplates])

  const handleReportSelect = (reportId: string) => {
    navigate(`/we-chat-app/admin/reports/ai/${reportId}`)
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
    setSelectedTemplate("")
  }

  const handleTemplateSelect = (value: string) => {
    setSelectedTemplate(value)
  }

  const handleCreateConfirm = async () => {
    if (!selectedTemplate) {
      message.error("请选择数据源")
      return
    }

    const formCount = getFormCountByTemplate(selectedTemplate)
    
    if(formCount < 10) {
      setShowGuideModal(true)
      return
    }

    setLoading(true)
    try {
      navigate(`/we-chat-app/admin/reports/ai/create/${selectedTemplate}`)
      handleCreateModalClose()
    } catch (error) {
      console.error("Error creating report:", error)
      message.error("创建报表失败")
    } finally {
      setLoading(false)
    }
  }

  const pageActions = (
    <Button 
      color="primary"
      startContent={<Icon icon="mdi:plus" />}
      onClick={handleCreateClick}
    >
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
        placement="center"
        classNames={{
          base: "max-w-md",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">选择数据源</ModalHeader>
          <ModalBody>
            <TemplateSelect
              templates={templates}
              value={selectedTemplate}
              onChange={handleTemplateSelect}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCreateModalClose}>
              取消
            </Button>
            <Button color="primary" onPress={handleCreateConfirm} isLoading={loading}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <GuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        formCount={getFormCountByTemplate(selectedTemplate)}
        templateId={selectedTemplate}
      />
    </PageLayout>
  )
}

export default ReportManagement