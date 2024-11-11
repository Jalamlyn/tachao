import React, { useEffect, useState } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ResourceTable from "./components/ResourceTable"
import UploadModal from "./components/UploadModal"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import message from "@/components/Message"

const ResourceManagement: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  const handleCreateResource = () => {
    setIsUploadModalOpen(true)
  }

  const handleUpload = async (data: any) => {
    try {
      // TODO: 实现实际的上传逻辑
      console.log("Uploaded data:", data)
      message.success("上传成功")
    } catch (error) {
      console.error("Upload error:", error)
      message.error("上传失败")
    }
  }

  const pageActions = (
    <Button onClick={handleCreateResource} color="primary">
      <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
      创建资料
    </Button>
  )

  return (
    <PageLayout title="资料管理" titleIcon="mdi:file-document" actions={pageActions}>
      <ResourceTable />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </PageLayout>
  )
}

export default ResourceManagement