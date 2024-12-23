import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Spinner, Button } from "@nextui-org/react"
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
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  useEffect(() => {
    const loadResource = async () => {
      if (!resourceId) return
      try {
        const { data } = await getDetail(resourceId)
        if (data) {
          setResource(data)
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
  }, [resourceId, getDetail])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <Icon icon='carbon:warning' className='w-16 h-16 text-danger mb-4' />
        <p className='text-xl font-medium text-danger'>{error || "资源不存在"}</p>
        <button
          onClick={() => navigate("/we-chat-app/admin/resources")}
          className='mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors'
        >
          返回资料列表
        </button>
      </div>
    )
  }

  return <ResourceDataTable id={resourceId} />
}

export default ResourceDetail
