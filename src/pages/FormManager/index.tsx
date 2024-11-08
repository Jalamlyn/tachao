import React, { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import FormList from "./components/FormList"
import SearchInput from "./components/SearchInput"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "../../contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"

const FormManager: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const { items: forms, load: loadForms } = useMetadata("form")
  const { items: templates, load: loadTemplates, getDetail: getTemplateDetail } = useMetadata("template")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const selectedTemplateIdRef = useRef<string>("")
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    loadForms()
    loadTemplateData()
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "单据管理", href: "/we-chat-app/admin/forms" },
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
    selectedTemplateIdRef.current = ""
    // 清除所有选中状态
    const templates = document.querySelectorAll('.template-item');
    templates.forEach(template => {
      template.classList.remove('border-primary', 'bg-primary/10');
    });
  }

  const handleTemplateClick = (templateId: string) => {
    selectedTemplateIdRef.current = templateId;
    
    // 使用 DOM 操作来更新视觉效果
    const templates = document.querySelectorAll('.template-item');
    templates.forEach(template => {
      template.classList.remove('border-primary', 'bg-primary/10');
    });
    
    const selectedTemplate = document.querySelector(`[data-template-id="${templateId}"]`);
    selectedTemplate?.classList.add('border-primary', 'bg-primary/10');
  };

  const { isLoading: isTemplateLoading, handleClick: handleTemplateSelect } = useAsyncButton(
    async () => {
      const templateId = selectedTemplateIdRef.current;
      if (!templateId) {
        message.error("请先选择模板");
        return;
      }
      try {
        const template = await getTemplateDetail(templateId)
        if (template && template.data.config) {
          window.open(`/form-preview/${templateId}`, "_blank")
        } else {
          message.error("加载模板失败")
        }
      } catch (error) {
        console.error("Failed to load template:", error)
        throw error
      }
    },
    {
      errorMessage: "加载模板失败"
    }
  )

  const { isLoading: isRefreshing, handleClick: handleRefresh } = useAsyncButton(
    async () => {
      await loadForms()
    },
    {
      errorMessage: "刷新失败"
    }
  )

  const handleAnalyze = () => {
    navigate("/we-chat-app/admin/forms/analysis")
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
    <PageLayout title='单据管理' titleIcon='mdi:file-document' actions={pageActions}>
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
                  data-template-id={template.id}
                  className={`template-item p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors`}
                  onClick={() => handleTemplateClick(template.id)}
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
            <Button
              color='primary'
              onClick={handleTemplateSelect}
              isDisabled={!selectedTemplateIdRef.current}
              isLoading={isTemplateLoading}
            >
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  )
}

export default FormManager