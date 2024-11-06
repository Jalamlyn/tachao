import React, { useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import FormPreview from "./components/FormPreview"
import MarkdownPreview from "./components/MarkdownPreview"
import CommandSection from "./components/CommandSection"

import { useFormState } from "./hooks/useFormState"
import { useTemplates } from "./hooks/useTemplates"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import message from "@/components/Message"

const DynamicFormTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<string>("preview")

  const {
    state: formState,
    setFormConfig,
    setSelectedTemplate,
    updateGenerationProgress,
    stopGenerating,
    addToHistory,
    handleError,
    appendGenerationProcess, // 新增：使用生成过程更新方法
    startGenerating, // 新增：使用开始生成方法
  } = useFormState()

  const { templates, handleTemplateChange, saveTemplate } = useTemplates()

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

  const handleAIResponse = useCallback(
    (result: { config: any; title: string }) => {
      if (result) {
        setFormConfig(result.config)
        addToHistory(result.title, result.config)
        setActiveTab("preview")
        stopGenerating()
      }
    },
    [setFormConfig, addToHistory, stopGenerating, setActiveTab]
  )

  const handleSaveTemplate = async () => {
    if (!formState.formConfig) {
      message.error("请先生成表单")
      return
    }

    try {
      await saveTemplate(formState.formConfig)
      message.success("模板保存成功")
    } catch (error) {
      handleError(error)
    }
  }

  const handleCopy = () => {
    message.success("复制成功")
  }

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:form-select' className='w-6 h-6' />
            <h2 className='text-2xl font-bold'>动态表单生成器</h2>
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
                        setActiveTab("preview")
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
              <MarkdownPreview 
                content={formState.generationProcess} // 修改：使用 generationProcess
                onCopy={handleCopy}
              />
            </TabsContent>
          </Tabs>

          <div className='mt-6'>
            <CommandSection
              disabled={formState.isGenerating}
              selectedTemplate={formState.selectedTemplate}
              templates={templates}
              onTemplateChange={onTemplateChange}
              isGenerating={formState.isGenerating}
              generationProgress={formState.generationProgress}
              error={formState.error}
              onAIResponse={handleAIResponse}
              onProgressUpdate={updateGenerationProgress}
              className='transition-all duration-300'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicFormTestPage