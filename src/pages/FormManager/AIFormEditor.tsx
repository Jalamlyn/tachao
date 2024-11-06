import React, { useCallback, useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNavigate, useParams } from "react-router-dom"
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react"
import FormPreview from "./components/FormPreview"
import { useFormState } from "./hooks/useFormState"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import CommandInput from "@/components/CommandInput"
import AIFormAgent from "@/service/agents/AIFormAgent"
import AIGenerationDialog from "@/components/AIGenerationDialog"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import message from "@/components/Message"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId: string }>()
  const isEditMode = Boolean(templateId)
  
  const {
    state: formState,
    setFormConfig,
    stopGenerating,
    addToHistory,
    handleError,
    appendGenerationProcess,
  } = useFormState()

  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false)

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
            addToHistory("加载模板", template.data.config)
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
        addToHistory(result.data.title || "编辑更新", result.data.config)
        stopGenerating()
      }
    },
    [setFormConfig, addToHistory, stopGenerating]
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
          message.success("模板更新成功")
          navigate("/we-chat-app/admin/documents")
        } else {
          message.error("更新模板失败")
        }
      } else {
        // 创建新模板
        const result = await createTemplate(templateData)
        if (result) {
          message.success("模板保存成功")
          navigate("/we-chat-app/admin/documents")
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

  // 添加查看生成过程的按钮处理函数
  const handleViewGenerationProcess = () => {
    if (formState.generationProcess) {
      setIsGenerationDialogOpen(true)
    }
  }

  return (
    <div className='container mx-auto py-8'>
      <Card style={{ border: "none" }}>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem href='/we-chat-app/admin/documents'>单据管理</BreadcrumbItem>
              <BreadcrumbItem>{isEditMode ? "编辑单据" : "生成单据"}</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:form-select' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>AI 单据助手</h2>
            </div>
          </div>
          <div className='flex gap-2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline'>
                  <Icon icon='mdi:history' className='w-4 h-4 mr-2' />
                  生成历史
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-80'>
                <div className='space-y-2'>
                  {formState.generationHistory.map((item, index) => (
                    <div
                      key={item.timestamp}
                      className='p-2 hover:bg-gray-100 rounded cursor-pointer'
                      onClick={() => {
                        setFormConfig(item.result)
                      }}
                    >
                      <div className='text-sm font-medium'>{item.command}</div>
                      <div className='text-xs text-gray-500'>
                        {formatDistanceToNow(item.timestamp, {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </div>
                    </div>
                  ))}
                  {formState.generationHistory.length === 0 && (
                    <div className='text-sm text-gray-500 text-center py-2'>暂无生成历史</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {/* 添加查看生成过程按钮 */}
            <Button variant='outline' onClick={handleViewGenerationProcess} disabled={!formState.generationProcess}>
              <Icon icon='hugeicons:ai-chat-02' className='w-4 h-4 mr-2' />
              查看对话历史
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!formState.formConfig}>
              <Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />
              {isEditMode ? "更新模板" : "保存模板"}
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
    </div>
  )
}

export default AIFormEditor