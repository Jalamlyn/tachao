import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { AppGallery } from "./components/AppGallery"
import { CreateAppModal } from "./components/CreateAppModal"
import { useAppManagement } from "./hooks/useAppManagement"

const AppManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const {
    apps,
    isLoading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateApp,
    isCreating
  } = useAppManagement()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
    ])
  }, [])

  const pageActions = (
    <Button 
      color="primary" 
      startContent={<Icon icon="mdi:plus" />}
      onPress={() => setIsCreateModalOpen(true)}
    >
      创建应用
    </Button>
  )

  return (
    <PageLayout title="应用管理" titleIcon="mdi:apps" actions={pageActions}>
      <div className="h-[calc(100vh-200px)] overflow-auto">
        <AppGallery apps={apps} isLoading={isLoading} />
      </div>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateApp}
        isLoading={isCreating}
      />
    </PageLayout>
  )
}

export default AppManagement