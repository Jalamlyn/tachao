import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import PageLayout from "@/components/PageLayout"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import EmptyState from "@/components/EmptyState"

const AppManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用管理", href: "/we-chat-app/admin/apps" },
    ])
  }, [])

  const pageActions = (
    <Button color="primary" startContent={<Icon icon="mdi:plus" />}>
      创建应用
    </Button>
  )

  return (
    <PageLayout title="应用管理" titleIcon="mdi:apps" actions={pageActions}>
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <EmptyState
          type="no-data"
          title="暂无应用"
          description="创建您的第一个应用"
          icon={<Icon icon="mdi:apps" className="w-20 h-20 text-default-400" />}
          action={{
            text: "创建应用",
            onClick: () => console.log("Create app clicked"),
          }}
        />
      </div>
    </PageLayout>
  )
}

export default AppManagement