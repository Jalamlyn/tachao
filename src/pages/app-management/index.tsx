import React, { useEffect, useState } from "react"
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { AppGallery } from "./components/AppGallery"
import { CreateAppModal } from "./components/CreateAppModal"
import { PageList } from "./components/PageList"
import { AppIndex, useAppStore } from "./store/useAppStore"

const AppManagement: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()
  const [selectedApp, setSelectedApp] = useState<AppIndex | null>(null)

  const {
    isCreateModalOpen,
    isDeleteModalOpen,
    appToDelete,
    setCreateModalOpen,
    setDeleteModalOpen,
    setAppToDelete,
    useApps,
    useCreateApp,
    useDeleteApp,
    reset,
  } = useAppStore()

  const { apps, isLoading } = useApps()
  const { createApp, isCreating } = useCreateApp()
  const { deleteApp, isDeleting } = useDeleteApp()

  useEffect(() => {
    return () => reset()
  }, [reset])

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
    ])
  }, [])

  const handleDevelopClick = (app: AppIndex) => {
    setSelectedApp(app)
  }

  const handleDeleteConfirm = async () => {
    if (!appToDelete) return
    await deleteApp(appToDelete.id)
    setDeleteModalOpen(false)
  }

  const pageActions = (
    <Button color='primary' startContent={<Icon icon='mdi:plus' />} onPress={() => setCreateModalOpen(true)}>
      创建应用
    </Button>
  )

  return (
    <PageLayout title='应用管理' titleIcon='mdi:apps' actions={pageActions}>
      <div className='h-[calc(100vh-200px)] overflow-auto'>
        <AppGallery apps={apps} isLoading={isLoading} onDevelopClick={handleDevelopClick} />
      </div>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createApp}
        isLoading={isCreating}
      />

      <PageList
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        app={selectedApp!}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setAppToDelete(null)
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除应用 "{appToDelete?.title}" 吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='light'
              onPress={() => {
                setDeleteModalOpen(false)
                setAppToDelete(null)
              }}
            >
              取消
            </Button>
            <Button color='danger' onPress={handleDeleteConfirm} isLoading={isDeleting}>
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default AppManagement