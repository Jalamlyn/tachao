import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { Select, SelectItem } from "@nextui-org/react"
import CreateResourceButton from "./components/CreateResourceButton"
import WordUploadButton from "./components/WordUploadButton"
import PDFUploadButton from "./components/PDFUploadButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ResourceGallery from "./components/ResourceGallery"
import { resourceTypes } from "./config/resourceTypes"
import message from "@/components/Message"

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const appId = import.meta.env.VITE_SHATA_AI_APP_ID
  const [selectedType, setSelectedType] = useState<string>("excel")

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  const handleSuccess = (data: any) => {
    message.success("上传成功")
    // TODO: 处理上传成功后的逻辑
  }

  const handleError = (error: Error) => {
    message.error(error.message || "上传失败")
  }

  const handleResourceSelect = (resourceId: string) => {
    window.open(`/resource/${resourceId}`, "_blank")
  }

  const renderUploadButton = () => {
    switch(selectedType) {
      case 'excel':
        return <CreateResourceButton appId={appId} isDisabled={false} />;
      case 'word':
        return <WordUploadButton onSuccess={handleSuccess} onError={handleError} />;
      case 'pdf':
        return <PDFUploadButton onSuccess={handleSuccess} onError={handleError} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout 
      title='资料管理' 
      titleIcon='mdi:file-document' 
      actions={
        <div className="flex items-center gap-4">
          <Select
            label="选择资源类型"
            selectedKeys={[selectedType]}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-48"
          >
            {Object.entries(resourceTypes).map(([id, type]) => (
              <SelectItem key={id} value={id}>
                <div className="flex items-center gap-2">
                  <Icon icon={type.icon} />
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </Select>

          {renderUploadButton()}
        </div>
      }
    >
      <ResourceGallery 
        onResourceSelect={handleResourceSelect} 
        className='transition-all duration-300'
        filter={selectedType}
      />
    </PageLayout>
  )
}

export default ResourceManagement