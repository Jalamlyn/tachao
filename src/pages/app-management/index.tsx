import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { AppGallery } from "./components/AppGallery"
import { CreateAppModal } from "./components/CreateAppModal"
import { useAppStore } from "./store/useAppStore"

const AppManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  
  // 使用 store 中的所有功能
  const {
    isCreateModalOpen,
    setCreateModalOpen,
    useApps,
    useCreateApp,
    reset
  } = useAppStore()

  // 使用查询 hook
  const { apps, isLoading } = useApps()
  
  // 使用变更 hook
  const { createApp, isCreating } = useCreateApp()

  // 清理函数
  useEffect(() => {
    return () => reset()
  }, [reset])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
    ])
  }, [updateBreadcrumbs])

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
        <AppGallery apps={apps} isLoading={isLoading} />
      </div>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createApp}
        isLoading={isCreating}
      />
    </PageLayout>
  )
}

export default AppManagement