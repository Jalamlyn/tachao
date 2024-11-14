import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from "@nextui-org/react"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { useMetadata } from "@/hooks/useMetadata"
import PageLayout from "@/components/PageLayout"
import ReportGallery from "./components/ReportGallery"
import message from "@/components/Message"

const ReportManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [templates, setTemplates] = useState<Array<{ id: string; title: string }>>([])
  const [loading, setLoading] = useState(false)

  // 使用 useMetadata 获取模板列表
  const { load: loadTemplates } = useMetadata("template")
  const { load: loadForms } = useMetadata("form")

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "报表管理", href: "/we-chat-app/admin/Reports" },
    ])
  }, [])

  // 加载模板列表
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

    setLoading(true)
    try {
      // 根据模板ID加载相关的表单数据
      const forms = await loadForms()
      if (!forms) {
        throw new Error("加载表单数据失败")
      }

      // 过滤出选中模板相关的表单
      const templateForms = forms.filter(form => 
        form.indexFields?.templateId === selectedTemplate
      )

      // 跳转到报表编辑页面，传递数据源信息
      navigate(`/we-chat-app/admin/reports/ai/create`, {
        state: {
          templateId: selectedTemplate,
          forms: templateForms
        }
      })
    } catch (error) {
      console.error("Error creating report:", error)
      message.error("创建报表失败")
    } finally {
      setLoading(false)
      handleCreateModalClose()
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
      <ReportGallery onReportSelect={handleReportSelect} className='transition-all duration-300' />

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={handleCreateModalClose}
        placement="center"
        classNames={{
          base: "max-w-md",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">选择数据源</ModalHeader>
          <ModalBody>
            <Select
              label="选择单据类型"
              placeholder="请选择单据类型"
              selectedKeys={selectedTemplate ? [selectedTemplate] : []}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title}
                </SelectItem>
              ))}
            </Select>
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
    </PageLayout>
  )
}

export default ReportManagement