import React, { useCallback, useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
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
import { useFormState } from "./hooks/useFormState"
import CommandInput from "@/components/CommandInput"
import AIFormAgent from "@/service/agents/AIFormAgent"
import AIGenerationDialog from "@/components/AIGenerationDialog"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)

  const { state: formState, setFormConfig, stopGenerating, handleError, appendGenerationProcess } = useFormState()

  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null)

  // 使用 useMetadata hook 来处理模板的保存和加载
  const { create: createTemplate, getDetail: getTemplateDetail, update: updateTemplate } = useMetadata("template")

  // 加载模板数据
  useEffect(() => {
    const loadTemplateData = async () => {
      if (isEditMode && templateId) {
        try {
          const template = await getTemplateDetail(templateId)
          if (template && template.data.config) {
            setFormConfig(template.data.config)
          } else {
            message.error("模板加载失败")
            navigate("/we-chat-app/admin/documents")
          }
        } catch (error) {
          handleError(error)
          navigate("/we-chat-app/admin/documents")
        }
      }
    }

    loadTemplateData()
  }, [templateId, isEditMode])

  const handleAIResponse = useCallback(
    (result: { type: string; data: any }) => {
      if ((result.type === "create" || result.type === "edit") && result.data) {
        setFormConfig(result.data.config)
        stopGenerating()
      }
    },
    [setFormConfig, stopGenerating]
  )

  const handleSaveTemplate = async () => {
    if (!formState.formConfig) {
      message.error("请先生成表单")
      return
    }

    try {
      const templateData = {
        title: formState.formConfig.metadata?.title || "新建模板",
        type: "custom",
        status: "active",
        data: {
          config: formState.formConfig,
          type: "custom",
          name: formState.formConfig.metadata?.title || "新建模板",
        },
      }

      if (isEditMode && templateId) {
        // 更新现有模板
        const result = await updateTemplate(templateId, templateData)
        if (result) {
          setSavedTemplateId(templateId)
          setIsSuccessModalOpen(true)
        } else {
          message.error("更新模板失败")
        }
      } else {
        // 创建新模板
        const result = await createTemplate(templateData)
        if (result) {
          setSavedTemplateId(result.id)
          setIsSuccessModalOpen(true)
        } else {
          message.error("保存模板失败")
        }
      }
    } catch (error) {
      handleError(error)
      message.error("保存模板失败")
    }
  }

  const handleChunk = useCallback(
    (chunk: string) => {
      appendGenerationProcess(chunk)
      setIsGenerationDialogOpen(true)
    },
    [appendGenerationProcess]
  )

  const handleViewGenerationProcess = () => {
    if (formState.generationProcess) {
      setIsGenerationDialogOpen(true)
    }
  }

  const handleCreateDocument = () => {
    if (savedTemplateId) {
      navigate(`/form-preview/${savedTemplateId}`)
    }
  }

  const handleGoToTemplates = () => {
    navigate("/we-chat-app/admin/documents")
  }

  return (
    <div className='container mx-auto py-8'>
      <Card style={{ border: "none" }}>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem href='/we-chat-app/admin/documents'>单据模板管理</BreadcrumbItem>
              <BreadcrumbItem>{isEditMode ? "编辑单据" : "生成单据"}</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:form-select' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>AI 单据助手</h2>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleViewGenerationProcess} disabled={!formState.generationProcess}>
              <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4 mr-2' />
              查看对话历史
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!formState.formConfig}>
              <Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />
              {isEditMode ? "更新单据模板" : "保存单据模板"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode='wait'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='space-y-4'
            >
              {formState.formConfig ? (
                <FormPreview config={formState.formConfig} />
              ) : (
                <div className='text-center py-12 text-gray-500'>
                  <Icon icon='mdi:form' className='w-12 h-12 mx-auto mb-4' />
                  <p>请输入您的需求,AI将为您生成表单</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className='mt-6'>
            <CommandInput
              agent={AIFormAgent}
              disabled={formState.isGenerating}
              onChunk={handleChunk}
              onCommand={handleAIResponse}
              className='transition-all duration-300'
            />
          </div>
        </CardContent>
      </Card>

      <AIGenerationDialog
        isOpen={isGenerationDialogOpen}
        onClose={() => setIsGenerationDialogOpen(false)}
        generationContent={formState.generationProcess}
        ResultComponent={formState.formConfig ? FormPreview : undefined}
        resultProps={formState.formConfig ? { config: formState.formConfig } : undefined}
      />

      {/* 成功提示对话框 */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} size='lg' placement='center'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex items-center gap-2'
            >
              <Icon icon='mdi:check-circle' className='w-6 h-6 text-success' />
              <span>模板{isEditMode ? "更新" : "保存"}成功</span>
            </motion.div>
          </ModalHeader>
          <ModalBody>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
              <p className='text-gray-600'>恭喜！您的单据模板已经{isEditMode ? "更新" : "保存"}成功。现在您可以：</p>
              <div className='flex flex-col gap-2'>
                <div className='p-4 border rounded-lg bg-gray-50'>
                  <h3 className='font-medium mb-2'>创建新单据</h3>
                  <p className='text-sm text-gray-500 mb-4'>使用这个模板立即创建一个新的单据，开始记录您的业务数据。</p>
                  <Button
                    color='primary'
                    onClick={handleCreateDocument}
                    startContent={<Icon icon='mdi:file-document-plus' className='w-4 h-4' />}
                  >
                    创建单据
                  </Button>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h3 className='font-medium mb-2'>返回模板管理</h3>
                  <p className='text-sm text-gray-500 mb-4'>返回模板列表查看或管理您的所有单据模板。</p>
                  <Button
                    variant='bordered'
                    onClick={handleGoToTemplates}
                    startContent={<Icon icon='mdi:format-list-bulleted' className='w-4 h-4' />}
                  >
                    查看所有模板
                  </Button>
                </div>
              </div>
            </motion.div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={() => setIsSuccessModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default AIFormEditor
