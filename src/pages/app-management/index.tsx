import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { AppGallery } from "./components/AppGallery"
import { CreateAppModal } from "./components/CreateAppModal"
import { DevelopModal } from "./components/DevelopModal"
import { useAppStore } from "./store/useAppStore"

const AppManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  
  const {
    isCreateModalOpen,
    isDevelopModalOpen,
    selectedApp,
    setCreateModalOpen,
    setDevelopModalOpen,
    setSelectedApp,
    useApps,
    useCreateApp,
    useUpdateAppConfig,
    reset
  } = useAppStore()

  const { apps, isLoading } = useApps()
  const { createApp, isCreating } = useCreateApp()
  const { updateAppConfig, isUpdating } = useUpdateAppConfig()

  useEffect(() => {
    return () => reset()
  }, [reset])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
    ])
  }, [updateBreadcrumbs])

  const handleDevelopClick = (app: AppIndex) => {
    setSelectedApp(app)
    setDevelopModalOpen(true)
  }

  const handleDevelopSubmit = async (templateIds: string[], reportIds: string[]) => {
    if (!selectedApp) return
    await updateAppConfig(selectedApp.id, { templateIds, reportIds })
  }

  const pageActions = (
    <Button 
      color="primary" 
      startContent={<Icon icon="mdi:plus" />}
      onPress={() => setCreateModalOpen(true)}
    >
      创建应用
    </Button>
  )

  return (
    <PageLayout title="应用管理" titleIcon="mdi:apps" actions={pageActions}>
      <div className="h-[calc(100vh-200px)] overflow-auto">
        <AppGallery 
          apps={apps} 
          isLoading={isLoading} 
          onDevelopClick={handleDevelopClick}
        />
      </div>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createApp}
        isLoading={isCreating}
      />

      <DevelopModal
        isOpen={isDevelopModalOpen}
        onClose={() => {
          setDevelopModalOpen(false)
          setSelectedApp(null)
        }}
        app={selectedApp}
        onSubmit={handleDevelopSubmit}
        isLoading={isUpdating}
      />
    </PageLayout>
  )
}

export default AppManagement