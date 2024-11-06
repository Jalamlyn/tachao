import React, { useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import FormPreview from "./components/FormPreview"
import CommandSection from "./components/CommandSection"

import { useFormState } from "./hooks/useFormState"
import { useTemplates } from "./hooks/useTemplates"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import message from "@/components/Message"
import { Progress } from "@nextui-org/react"

const DynamicFormTestPage: React.FC = () => {
  const {
    state: formState,
    setFormConfig,
    setSelectedTemplate,
    updateGenerationProgress,
    stopGenerating,
    addToHistory,
    handleError,
    appendGenerationProcess,
    startGenerating,
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
      await saveTemplate(formState.formConfig)
      message.success("模板保存成功")
    } catch (error) {
      handleError(error)
    }
  }

  const handleChunk = useCallback((chunk: string) => {
    appendGenerationProcess(chunk)
  }, [appendGenerationProcess])

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader className='flex justify-between items-center'>
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
          <AnimatePresence mode='wait'>
            {formState.isGenerating ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-4'
              >
                <div className='w-full space-y-2'>
                  <Progress
                    size='sm'
                    value={formState.generationProgress}
                    color='primary'
                    className='max-w-md'
                  />
                  <p className='text-sm text-gray-500'>正在生成表单... {formState.generationProgress}%</p>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <pre className='whitespace-pre-wrap font-mono text-sm'>{formState.generationProcess}</pre>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FormPreview config={formState.formConfig} />
              </motion.div>
            )}
          </AnimatePresence>

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
              onChunk={handleChunk}
              className='transition-all duration-300'
            />
          </div>

          {/* AI 生成过程显示区域 */}
          <AnimatePresence>
            {formState.markdownContent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className='mt-6'
              >
                <Card>
                  <CardHeader>
                    <h3 className='text-lg font-semibold'>AI 生成过程</h3>
                  </CardHeader>
                  <CardContent>
                    <div className='bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-auto'>
                      <pre className='whitespace-pre-wrap font-mono text-sm'>{formState.markdownContent}</pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicFormTestPage