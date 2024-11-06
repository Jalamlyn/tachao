import React, { useState, useCallback } from "react"
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
import FormPreview from "../FormTempManager/components/FormPreview"
import { useNavigate } from "react-router-dom"
import message from "@/components/Message"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const { items: forms, load: loadForms, create: createForm, getIndexes } = useMetadata("form")
  const { items: templates, load: loadTemplates, getDetail: getTemplateDetail } = useMetadata("template")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredForms = forms.filter((form) => form.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateDocument = () => {
    loadTemplates()
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
        // 直接导航到预览页面
        window.open(`/form-preview/${templateId}`, "_blank")
      } else {
        message.error("加载模板失败")
      }
    } catch (error) {
      console.error("Failed to load template:", error)
      message.error("加载模板失败")
    }
  }

  // 添加刷新函数
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const indexes = await getIndexes()
      if (indexes) {
        message.success("刷新成功")
      }
    } catch (error) {
      console.error("Failed to refresh forms:", error)
      message.error("刷新失败")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className='container mx-auto py-8'>
      <Card style={{ border: "none" }}>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem>单据管理</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:file-document' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>单据管理</h2>
            </div>
          </div>
          <div className='flex gap-2'>
            {/* 添加刷新按钮 */}
            <Button 
              isIconOnly 
              variant="light" 
              onClick={handleRefresh} 
              isLoading={isRefreshing}
            >
              <Icon icon='mdi:refresh' className='w-5 h-5' />
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
            <FormList forms={filteredForms} />
          </div>
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
                  onClick={() => handleTemplateSelect(template.id)}
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FormManager