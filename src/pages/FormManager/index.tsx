import React, { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Button,
  Modal,
  Card,
  CardContent,
  CardHeader,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalFooter,
  Input,
  useDisclosure,
  Image,
  Tooltip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import FormList from "./components/FormList"
import SearchInput from "./components/SearchInput"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"
import { motion, AnimatePresence } from "framer-motion"
import { useBreadcrumb } from '../../contexts/BreadcrumbContext'
import PageLayout from "@/components/PageLayout"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const { items: forms, load: loadForms } = useMetadata("form")
  const { items: templates, load: loadTemplates, getDetail: getTemplateDetail } = useMetadata("template")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAppTypeModalOpen, setIsAppTypeModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    loadForms()
    loadTemplateData()
    updateBreadcrumbs([
      { label: '首页', href: '/we-chat-app/admin' },
      { label: '单据管理', href: '/we-chat-app/admin/forms' }
    ])
  }, [])

  const loadTemplateData = async () => {
    setIsLoadingTemplates(true)
    try {
      await loadTemplates()
    } catch (error) {
      console.error("Failed to load templates:", error)
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredForms = forms.filter((form) => form.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true)
  }

  const handleModalClose = () => {
    setIsCreateModalOpen(false)
    setSelectedTemplateId("")
  }

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId)
    try {
      const template = await getTemplateDetail(templateId)
      if (template && template.data.config) {
        window.open(`/form-preview/${templateId}`, "_blank")
      } else {
        message.error("加载模板失败")
      }
    } catch (error) {
      console.error("Failed to load template:", error)
      message.error("加载模板失败")
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await loadForms()
    } catch (error) {
      console.error("Failed to refresh forms:", error)
      message.error("刷新失败")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAnalyze = () => {
    navigate("/we-chat-app/admin/forms/analysis")
  }

  const handleCreateTemplate = () => {
    navigate("/we-chat-app/admin/documents/create")
  }

  const pageActions = (
    <>
      <Button isIconOnly variant='light' onClick={handleRefresh} isLoading={isRefreshing}>
        <Icon icon='mdi:refresh' className='w-5 h-5' />
      </Button>
      <Button
        onClick={handleAnalyze}
        color='secondary'
        startContent={<Icon icon='solar:chart-2-bold' className='w-4 h-4' />}
      >
        AI 数据分析
      </Button>
      <Button onClick={handleCreateDocument} color='primary'>
        <Icon icon='mdi:file-document-plus' className='w-4 h-4 mr-2' />
        创建单据
      </Button>
    </>
  )

  return (
    <PageLayout
      title="单据管理"
      titleIcon="mdi:file-document"
      actions={pageActions}
    >
      <div className='space-y-4'>
        <SearchInput onSearch={handleSearch} />
        <FormList forms={filteredForms} onDelete={handleRefresh} />
      </div>

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
            <Button color='primary' onClick={() => handleTemplateSelect(selectedTemplateId)} isDisabled={!selectedTemplateId}>
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default FormManager