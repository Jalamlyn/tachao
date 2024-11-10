import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"

import TemplateGallery from "./FormTempManager.component.TemplateGallery"
import { useBreadcrumb } from "../contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "单据模板管理", href: "/we-chat-app/admin/documents" },
    ])
  }, [])

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/form-preview/${templateId}`)
  }

  const pageActions = (
    <Button onClick={handleCreateTemplate} color='primary'>
      <Icon icon='mdi:plus' className='w-4 h-4 mr-2' />
      生成单据模板
    </Button>
  )

  return (
    <PageLayout title='单据模板管理' titleIcon='mdi:form-select' actions={pageActions}>
      <TemplateGallery onTemplateSelect={handleTemplateSelect} className='transition-all duration-300' />
    </PageLayout>
  )
}

export default FormManager
