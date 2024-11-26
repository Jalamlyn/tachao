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
import { motion } from "framer-motion"

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
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Select
            label="选择资源类型"
            selectedKeys={[selectedType]}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-48"
            classNames={{
              trigger: "h-12 data-[hover=true]:bg-default-100 transition-colors duration-200",
              value: "text-default-700",
              label: "text-default-600",
              innerWrapper: "gap-2",
              listbox: "p-2",
              popoverContent: "min-w-[200px]"
            }}
          >
            {Object.entries(resourceTypes).map(([id, type]) => (
              <SelectItem 
                key={id} 
                value={id}
                className="data-[hover=true]:bg-default-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <Icon icon={type.icon} className={`
                    w-5 h-5
                    ${id === 'excel' ? 'text-green-600' : ''}
                    ${id === 'word' ? 'text-blue-600' : ''}
                    ${id === 'pdf' ? 'text-red-600' : ''}
                  `} />
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </Select>

          <motion.div
            key={selectedType}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {renderUploadButton()}
          </motion.div>
        </motion.div>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ResourceGallery 
          onResourceSelect={handleResourceSelect} 
          className='transition-all duration-300'
          filter={selectedType}
        />
      </motion.div>
    </PageLayout>
  )
}

export default ResourceManagement