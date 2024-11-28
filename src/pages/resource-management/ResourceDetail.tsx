import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useMetadata } from "@/hooks/useMetadata"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ResourceDataTable from "@/components/common/data-table/ResourceDataTable"
import message from "@/components/Message"

const ResourceDetail: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { getDetail } = useMetadata("resource")
  const [resource, setResource] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadResource = async () => {
      if (!resourceId) return
      try {
        const resourceData = await getDetail(resourceId)
        if (resourceData) {
          setResource(resourceData)
          updateBreadcrumbs([
            { label: "首页", href: "/we-chat-app/admin" },
            { label: "资料管理", href: "/we-chat-app/admin/resources" },
            { label: resourceData.title, href: `/we-chat-app/admin/resources/${resourceId}` },
          ])
        } else {
          setError("资源不存在")
          message.error("资源不存在")
        }
      } catch (error) {
        console.error("Error loading resource:", error)
        setError("加载资源失败")
        message.error("加载资源失败")
      } finally {
        setLoading(false)
      }
    }

    loadResource()
  }, [resourceId, getDetail, updateBreadcrumbs])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner label="加载中..." />
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Icon icon="carbon:warning" className="w-16 h-16 text-danger mb-4" />
        <p className="text-xl font-medium text-danger">{error || "资源不存在"}</p>
        <button
          onClick={() => navigate("/we-chat-app/admin/resources")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          返回资料列表
        </button>
      </div>
    )
  }

  const renderContent = () => {
    const type = resource.indexFields?.type?.toLowerCase()
    
    switch (type) {
      case "excel":
        return <ResourceDataTable id={resourceId} appId={resource.indexFields?.appId} />
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <Icon icon="carbon:document-unknown" className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-600">暂不支持该类型资源的预览</p>
          </div>
        )
    }
  }

  return (
    <PageLayout
      title={resource.title}
      titleIcon="mdi:file-document"
      subtitle={`大小：${(resource.indexFields?.size / 1024 / 1024).toFixed(2)}MB · 类型：${
        resource.indexFields?.type || "未知"
      } · 文件名：${resource.indexFields?.fileName || "未知"}`}
    >
      <div className="bg-white rounded-lg shadow">
        {renderContent()}
      </div>
    </PageLayout>
  )
}

export default ResourceDetail