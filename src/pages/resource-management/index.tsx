import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"
import { Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import CreateResourceButton from "./components/CreateResourceButton"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { useMetadata } from "@/hooks/useMetadata"
import PageLayout from "@/components/PageLayout"
import ResourceGallery from "./components/ResourceGallery"
import { resourceTypes } from "./config/resourceTypes"
import message from "@/components/Message"
import { motion } from "framer-motion"
import SearchInput from "@/components/SearchInput"

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [selectedType, setSelectedType] = React.useState<string>("excel")
  const galleryRef = useRef<{ loadResources: () => Promise<void> }>()
  const { create } = useMetadata("resource")

  // 新增状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料表格管理", href: "/we-chat-app/admin/resources" },
    ])
  }, [])

  const handleSuccess = (data: any) => {
    galleryRef.current?.loadResources()
  }

  const handleError = (error: Error) => {
    message.error(error.message || "上传失败")
  }

  const handleResourceSelect = (resourceId: string) => {
    window.open(`/resource/${resourceId}`, "_blank")
  }

  // 新增创建资料的处理函数
  const handleCreate = async () => {
    if (!newTitle.trim()) {
      message.error("请输入资料名称")
      return
    }
    
    setIsCreating(true)
    try {
      const resourceId = `resource_${newTitle.trim().toLowerCase().replace(/\s+/g, '_')}`
      const resourceData = {
        id: resourceId,
        title: newTitle.trim(),
        data: [],
        status: "active",
        indexFields: {
          type: "excel",
          rawData: {},
        },
      }

      await create(resourceData)
      message.success("创建成功")
      setIsCreateModalOpen(false)
      setNewTitle("")
      // 刷新资源列表
      galleryRef.current?.loadResources()
    } catch (error) {
      console.error("创建资料失败:", error)
      message.error("创建失败")
    } finally {
      setIsCreating(false)
    }
  }

  const renderUploadButton = (type: string) => {
    switch (type) {
      case "excel":
        return (
          <div className="flex gap-2">
            <Button 
              color="primary"
              onPress={() => setIsCreateModalOpen(true)}
              className="text-white"
              startContent={<Icon icon="mdi:plus" width="20" height="20" />}
            >
              新建资料
            </Button>
            <CreateResourceButton isDisabled={false} onSuccess={handleSuccess} />
          </div>
        )
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

  const visibleResourceTypes = Object.entries(resourceTypes).filter(([_, type]) => !type.hidden)

  return (
    <PageLayout title='资料表格管理' titleIcon='mdi:file-document'>
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
          {visibleResourceTypes.map(([id, type]) => (
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

      {/* 新增创建资料的 Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">新建资料</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="资料名称"
                  placeholder="请输入资料名称"
                  variant="bordered"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate()
                    }
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreate}
                  isLoading={isCreating}
                  isDisabled={!newTitle.trim()}
                >
                  创建
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default ResourceManagement