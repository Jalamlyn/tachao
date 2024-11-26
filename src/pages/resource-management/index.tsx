import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import CreateResourceButton from "./components/CreateResourceButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ResourceGallery from "./components/ResourceGallery"

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const appId = import.meta.env.VITE_SHATA_AI_APP_ID

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  const handleResourceSelect = (resourceId: string) => {
    window.open(`/resource/${resourceId}`, "_blank")
  }

  const pageActions = (
    <>
      <CreateResourceButton appId={appId} isDisabled={false} />
    </>
  )

  return (
    <PageLayout title='资料管理' titleIcon='mdi:file-document' actions={pageActions}>
      <ResourceGallery onResourceSelect={handleResourceSelect} className='transition-all duration-300' />
    </PageLayout>
  )
}

export default ResourceManagement