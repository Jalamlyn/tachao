import React, { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import {
  Breadcrumbs,
  BreadcrumbItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react"
import FormList from "./components/FormList"
import SearchInput from "./components/SearchInput"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"
import { motion, AnimatePresence } from "framer-motion"
import { useBreadcrumb } from '../../contexts/BreadcrumbContext'

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const { items: forms, load: loadForms } = useMetadata("form")
  const { items: templates, load: loadTemplates, getDetail: getTemplateDetail } = useMetadata("template")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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
  }, [loadForms, updateBreadcrumbs])

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

  const EmptyTemplateState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 bg-default-50 rounded-lg"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Icon icon="solar:document-add-bold-duotone" className="w-24 h-24 text-default-400 mb-4" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">还没有可用的单据模板</h3>
      <p className="text-sm text-default-500 mb-6 text-center max-w-md">
        在创建单据之前，您需要先创建一个单据模板。单据模板将帮助您标准化数据录入和管理流程。
      </p>
      <Button
        color="primary"
        size="lg"
        endContent={<Icon icon="solar:add-circle-bold-duotone" />}
        onClick={handleCreateTemplate}
      >
        创建单据模板
      </Button>
    </motion.div>
  )

  return (
    <div className='container mx-auto px-4'>
      <Card style={{ border: "none" }}>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:file-document' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>单据管理</h2>
            </div>
          </div>
          <div className='flex gap-2'>
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
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <SearchInput onSearch={handleSearch} />
            <FormList forms={filteredForms} onDelete={handleRefresh} />
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={handleModalClose} size='2xl'>
        <ModalContent>
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center p-8">
              <Spinner label="加载模板中..." />
            </div>
          ) : templates && templates.length > 0 ? (
            <>
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
            </>
          ) : (
            <ModalBody>
              <EmptyTemplateState />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FormManager