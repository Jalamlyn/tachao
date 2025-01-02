import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

import TemplateGallery from "./components/TemplateGallery"
import { useBreadcrumb } from "../../contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "表单模板管理", href: "/admin/documents" },
    ])
  }, [])

  const handleCreateTemplate = () => {
    navigate("/admin/documents/create")
  }

  const handleTemplateSelect = (templateId: string) => {
    window.open(`/form-create/${templateId}`, "_blank")
  }

  const pageActions = (
    <Button onClick={handleCreateTemplate} color='primary'>
      <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4 mr-2' />
      生成表单模板
    </Button>
  )

  return (
    <PageLayout title='表单模板管理' titleIcon='mdi:form-select' actions={pageActions}>
      <TemplateGallery onTemplateSelect={handleTemplateSelect} className='transition-all duration-300' />
    </PageLayout>
  )
}

export default FormManager
