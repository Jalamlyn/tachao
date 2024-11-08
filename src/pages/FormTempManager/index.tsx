import React, { useCallback, useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Breadcrumbs,
  BreadcrumbItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"

import FormPreview from "./components/FormPreview"
import TemplateGallery from "./components/TemplateGallery"
import { useFormState } from "./hooks/useFormState"
import { useTemplates } from "./hooks/useTemplates"
import DynamicForm from "@/components/common/DynamicForm"
import { useBreadcrumb } from '../../contexts/BreadcrumbContext'

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const { state: formState, setFormConfig, setSelectedTemplate } = useFormState()
  const { templates, handleTemplateChange } = useTemplates()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: '首页', href: '/we-chat-app/admin' },
      { label: '单据模板管理', href: '/we-chat-app/admin/documents' }
    ])
  }, [updateBreadcrumbs])

  const onTemplateSelect = async (templateId: string) => {
    try {
      setSelectedTemplate(templateId)
      const config = await handleTemplateChange(templateId)
      if (config) {
        setFormConfig(config)
      } else {
        setFormConfig(null)
      }
    } catch (error) {
      console.error("Error loading template:", error)
    }
  }

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true)
  }

  const handleModalClose = () => {
    setIsCreateModalOpen(false)
    setSelectedTemplateId("")
  }

  const handleTemplateConfirm = async () => {
    if (selectedTemplateId) {
      const config = await handleTemplateChange(selectedTemplateId)
      if (config) {
        navigate(`/we-chat-app/admin/forms/create/${selectedTemplateId}`)
      }
    }
    handleModalClose()
  }

  return (
    <div className='container mx-auto p-2'>
      <Card style={{ border: "none" }}>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:form-select' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>单据模板管理</h2>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleCreateTemplate}>
              <Icon icon='mdi:plus' className='w-4 h-4 mr-2' />
              生成单据模板
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <TemplateGallery onTemplateSelect={onTemplateSelect} className='transition-all duration-300' />
        </CardContent>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={handleModalClose} size='2xl'>
        <ModalContent>
          <ModalHeader>选择单据模板</ModalHeader>
          <ModalBody>
            <div className='grid grid-cols-3 gap-4'>
              {templates?.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                    selectedTemplateId === template.id ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div className='flex items-center gap-2'>
                    <Icon icon='mdi:file-document-outline' className='w-5 h-5' />
                    <span className='font-medium truncate'>{template.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='danger' variant='light' onClick={handleModalClose}>
              取消
            </Button>
            <Button color='primary' onClick={handleTemplateConfirm} isDisabled={!selectedTemplateId}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FormManager