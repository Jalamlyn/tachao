import React, { useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNavigate } from "react-router-dom"
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react"
import FormPreview from "./components/FormPreview"
import { useFormState } from "./hooks/useFormState"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import CommandInput from "@/components/CommandInput"
import AIFormAgent from "@/service/agents/AIFormAgent"

const AIFormEditor: React.FC = () => {
  const navigate = useNavigate()
  const {
    state: formState,
    setFormConfig,
    updateGenerationProgress,
    stopGenerating,
    addToHistory,
    handleError,
    appendGenerationProcess,
  } = useFormState()

  const handleAIResponse = useCallback(
    (result: { type: string; data: any }) => {
      if (result.type === "create" && result.data) {
        setFormConfig(result.data.config)
        addToHistory(result.data.title, result.data.config)
        stopGenerating()
      }
    },
    [setFormConfig, addToHistory, stopGenerating]
  )

  const handleSaveTemplate = async () => {
    if (!formState.formConfig) {
      return
    }

    try {
      navigate("/we-chat-app/admin/documents")
    } catch (error) {
      handleError(error)
    }
  }

  const handleChunk = useCallback(
    (chunk: string) => {
      console.log(chunk)
      appendGenerationProcess(chunk)
    },
    [appendGenerationProcess]
  )

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader className='flex flex-row justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <Breadcrumbs>
              <BreadcrumbItem href='/we-chat-app/admin'>首页</BreadcrumbItem>
              <BreadcrumbItem href='/we-chat-app/admin/documents'>单据管理</BreadcrumbItem>
              <BreadcrumbItem>创建模板</BreadcrumbItem>
            </Breadcrumbs>
            <div className='flex items-center gap-2'>
              <Icon icon='mdi:form-select' className='w-6 h-6' />
              <h2 className='text-2xl font-bold'>AI 表单生成器</h2>
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
            <Button onClick={handleSaveTemplate} disabled={!formState.formConfig}>
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
                <div className='bg-gray-50 rounded-lg p-4'>
                  <pre className='whitespace-pre-wrap font-mono text-sm'>{formState.generationProcess}</pre>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
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
            )}
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
    </div>
  )
}

export default AIFormEditor