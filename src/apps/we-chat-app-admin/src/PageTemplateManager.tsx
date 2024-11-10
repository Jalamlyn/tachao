import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import TemplateGallery from "./components/page-templates/TemplateGallery"

const PageTemplateManager: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "页面模板管理", href: "/we-chat-app/admin/pages" },
    ])
  }, [])

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/pages/create")
  }

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/we-chat-app/admin/pages/edit/${templateId}`)
  }

  const pageActions = (
    <Button 
      onClick={handleCreateTemplate} 
      color="primary"
      startContent={<Icon icon="solar:add-circle-bold" className="w-4 h-4" />}
    >
      创建页面模板
    </Button>
  )

  return (
    <PageLayout 
      title="页面模板管理" 
      titleIcon="solar:layout-left-outline" 
      actions={pageActions}
    >
      <TemplateGallery 
        onTemplateSelect={handleTemplateSelect} 
        className="transition-all duration-300" 
      />
    </PageLayout>
  )
}

export default PageTemplateManager