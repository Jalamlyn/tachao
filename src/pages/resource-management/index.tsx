import React, { useEffect } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import ResourceTable from "./components/ResourceTable"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"

const ResourceManagement: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  const handleCreateResource = () => {
    // TODO: 实现创建资料功能
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
    </PageLayout>
  )
}

export default ResourceManagement