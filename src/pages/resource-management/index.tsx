import React, { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { Tabs, Tab } from "@nextui-org/react"
import CreateResourceButton from "./components/CreateResourceButton"
import WordUploadButton from "./components/WordUploadButton"
import PDFUploadButton from "./components/PDFUploadButton"
import ImageUploadButton from "./components/ImageUploadButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import ResourceGallery from "./components/ResourceGallery"
import { resourceTypes } from "./config/resourceTypes"
import message from "@/components/Message"
import { motion } from "framer-motion"
import SearchInput from "@/components/SearchInput"

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const appId = import.meta.env.VITE_SHATA_AI_APP_ID
  const [selectedType, setSelectedType] = React.useState<string>("excel")
  const galleryRef = useRef<{ loadResources: () => Promise<void> }>()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  const handleSuccess = (data: any) => {
    message.success("上传成功")
    // 调用ResourceGallery的刷新方法
    galleryRef.current?.loadResources()
  }

  const handleError = (error: Error) => {
    message.error(error.message || "上传失败")
  }

  const handleResourceSelect = (resourceId: string) => {
    window.open(`/resource/${resourceId}`, "_blank")
  }

  const renderUploadButton = (type: string) => {
    switch (type) {
      case "excel":
        return <CreateResourceButton appId={appId} isDisabled={false} onSuccess={handleSuccess} />
      case "word":
        return <WordUploadButton onSuccess={handleSuccess} onError={handleError} />
      case "pdf":
        return <PDFUploadButton onSuccess={handleSuccess} onError={handleError} />
      case "image":
        return <ImageUploadButton onSuccess={handleSuccess} onError={handleError} />
      default:
        return null
    }
  }

  const renderHeader = (searchProps: { value: string; onChange: (value: string) => void; placeholder?: string }) => (
    <div className='flex justify-between items-center gap-4'>
      <SearchInput {...searchProps} className='flex-1 max-w-xl' />
      {renderUploadButton(selectedType)}
    </div>
  )

  const renderTabContent = (type: string) => (
    <motion.div
      key={type}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className='flex flex-col gap-4'
    >
      <ResourceGallery
        ref={galleryRef}
        onResourceSelect={handleResourceSelect}
        className='transition-all duration-300'
        renderHeader={renderHeader}
      />
    </motion.div>
  )

  return (
    <PageLayout title='资料管理' titleIcon='mdi:file-document'>
      <div className='flex flex-col gap-4'>
        <Tabs
          selectedKey={selectedType}
          onSelectionChange={(key) => setSelectedType(key.toString())}
          variant='underlined'
          classNames={{
            tabList: "gap-6",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-2 h-12",
            tabContent: "group-data-[selected=true]:text-primary",
          }}
        >
          {Object.entries(resourceTypes).map(([id, type]) => (
            <Tab
              key={id}
              isDisabled={type.disabled}
              title={
                <div className='flex items-center gap-2'>
                  <Icon
                    icon={type.icon}
                    className={`w-5 h-5
                      ${id === "excel" ? "text-green-600 group-data-[selected=true]:text-primary" : ""}
                      ${id === "word" ? "text-blue-600 group-data-[selected=true]:text-primary" : ""}
                      ${id === "pdf" ? "text-red-600 group-data-[selected=true]:text-primary" : ""}
                      ${id === "image" ? "text-yellow-600 group-data-[selected=true]:text-primary" : ""}
                    `}
                  />
                  <span>{type.name}</span>
                </div>
              }
            >
              {renderTabContent(id)}
            </Tab>
          ))}
        </Tabs>
      </div>
    </PageLayout>
  )
}

export default ResourceManagement