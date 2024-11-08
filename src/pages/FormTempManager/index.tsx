import React, { useCallback, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"

import CreateAppModal from "./CreateAppModal"
import AppTypeCard from "./AppTypeCard"
import TemplateGallery from "./components/TemplateGallery"
import { useBreadcrumb } from "../../contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"

const FormManager: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAppTypeModalOpen, setIsAppTypeModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedAppType, setSelectedAppType] = useState<"install" | "blank" | null>(null)
  const navigate = useNavigate()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "单据模板管理", href: "/we-chat-app/admin/documents" },
    ])
  }, [])

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  const handleTemplateSelect = () => {
    setIsTemplateModalOpen(false)
    setIsCreateModalOpen(true)
  }

  const handleTemplateCancel = () => {
    setIsTemplateModalOpen(false)
    setIsAppTypeModalOpen(true)
  }

  const pageActions = (
    <Button onClick={handleCreateTemplate} color='primary'>
      <Icon icon='mdi:plus' className='w-4 h-4 mr-2' />
      生成单据模板
    </Button>
  )

  return (
    <PageLayout title='单据模板管理' titleIcon='mdi:form-select' actions={pageActions}>
      <TemplateGallery onTemplateSelect={handleTemplateSelect} className='transition-all duration-300' />

      <Modal isOpen={isAppTypeModalOpen} onClose={() => setIsAppTypeModalOpen(false)} size='xl'>
        <ModalContent>
          <ModalHeader>
            <h3>选择创建应用的方式</h3>
          </ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <AppTypeCard
                title='安装应用'
                headerTitle='创建方式'
                icon='mdi:application-import'
                onClick={() => setSelectedAppType("install")}
                description='使用预配置的模板快速创建应用'
              />
              <AppTypeCard
                title='空白应用'
                headerTitle='创建方式'
                icon='mdi:application-outline'
                onClick={() => setSelectedAppType("blank")}
                description='从头开始创建自定义应用'
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} size='xl'>
        <ModalContent>
          <ModalHeader>
            <h3>选择应用模板</h3>
          </ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              <AppTypeCard
                title='离散制造业ERP'
                headerTitle='模板'
                icon='mdi:application-cog'
                onClick={handleTemplateSelect}
                description='适用于离散制造业的ERP系统模板'
                imageSrc='https://picsum.photos/seed/erp/300/200'
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='flat' onPress={handleTemplateCancel}>
              取消
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateApp={() => {}}
        appType={selectedAppType}
      />
    </PageLayout>
  )
}

export default FormManager
