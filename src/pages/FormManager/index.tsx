import React, { useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence } from "framer-motion"

// 导入新组件
import FormPreview from "./components/FormPreview"
import MarkdownPreview from "./components/MarkdownPreview"
import CommandSection from "./components/CommandSection"

// 导入hooks
import { useFormState } from "./hooks/useFormState"
import { useTemplates } from "./hooks/useTemplates"

const DynamicFormTestPage: React.FC = () => {
  // 使用自定义hooks
  const {
    state: formState,
    setFormConfig,
    setMarkdownContent,
    setSelectedTemplate,
    startGenerating,
    stopGenerating,
    handleError,
  } = useFormState()

  const { templates, isLoading, handleTemplateChange, saveTemplate } = useTemplates()

  // 处理模板选择
  const onTemplateChange = async (templateId: string) => {
    try {
      setSelectedTemplate(templateId)
      const config = await handleTemplateChange(templateId)
      if (config) {
        setFormConfig(config)
      } else {
        setFormConfig(null)
      }
    } catch (error) {
      handleError(error)
    }
  }

  // 保存模板
  const handleSaveTemplate = async () => {
    if (!formState.formConfig) {
      return
    }

    try {
      await saveTemplate(formState.formConfig)
    } catch (error) {
      handleError(error)
    }
  }

  const [activeTab, setActiveTab] = React.useState<string>("preview")

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:form-select' className='w-6 h-6' />
            <h2 className='text-2xl font-bold'>动态表单生成器</h2>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleSaveTemplate}
              disabled={!formState.formConfig}
              className='transition-all duration-200 hover:scale-105'
            >
              <Icon icon='mdi:content-save' className='w-4 h-4 mr-2' />
              保存模板
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value='preview' className='flex items-center gap-2'>
                <Icon icon='mdi:eye' className='w-4 h-4' />
                表单预览
              </TabsTrigger>
              <TabsTrigger value='markdown' className='flex items-center gap-2'>
                <Icon icon='mdi:markdown' className='w-4 h-4' />
                生成过程
              </TabsTrigger>
            </TabsList>

            <TabsContent value='preview'>
              <AnimatePresence mode='wait'>
                <FormPreview config={formState.formConfig} />
              </AnimatePresence>
            </TabsContent>

            <TabsContent value='markdown'>
              <MarkdownPreview content={formState.markdownContent} />
            </TabsContent>
          </Tabs>

          <div className='mt-6'>
            <CommandSection
              disabled={formState.isGenerating}
              selectedTemplate={formState.selectedTemplate}
              templates={templates}
              onTemplateChange={onTemplateChange}
              className='transition-all duration-300'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicFormTestPage
