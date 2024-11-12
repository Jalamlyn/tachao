import React, { useEffect } from "react"
import ResourceTable from "./components/ResourceTable"
import CreateResourceButton from "./components/CreateResourceButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"

const ResourceManagement: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()
  const appId = import.meta.env.VITE_SHATA_AI_APP_ID

  // 使用 useMetadata hook 获取资源数据
  const {
    items: resources,
    loading: resourceLoading,
    error: resourceError,
    load: loadResources,
  } = useMetadata("resource")

  // 初始化面包屑
  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  // 加载资源数据
  useEffect(() => {
    loadResources().catch((error) => {
      console.error("Error loading resources:", error)
      message.error("加载资源列表失败")
    })
  }, [])

  // 如果出现错误，显示错误信息
  if (resourceError) {
    message.error(resourceError)
  }

  const pageActions = (
    <div className='flex gap-2'>
      <CreateResourceButton appId={appId} isDisabled={!appId} />
    </div>
  )
  return (
    <PageLayout title='资料管理' titleIcon='mdi:file-document' actions={pageActions} loading={resourceLoading}>
      <ResourceTable resources={resources} onRefresh={loadResources} />
    </PageLayout>
  )
}

export default ResourceManagement
