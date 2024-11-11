import React, { useEffect } from "react"
import ResourceTable from "./components/ResourceTable"
import CreateResourceButton from "./components/CreateResourceButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useSearchParams } from "react-router-dom"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"

const ResourceManagement: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()
  const [searchParams] = useSearchParams()
  const appId = searchParams.get("appId")

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
  }, [updateBreadcrumbs])

  // 加载资源数据
  useEffect(() => {
    if (appId) {
      loadResources().catch((error) => {
        console.error("Error loading resources:", error)
        message.error("加载资源列表失败")
      })
    }
  }, [appId, loadResources])

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