import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectItem } from "@nextui-org/react"
import message from "@/components/Message"
import DynamicForm from "@/components/common/DynamicForm"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import { Icon } from "@iconify/react"
import CommandInput from "@/components/CommandInput"
import { motion, AnimatePresence } from "framer-motion"

// 状态接口定义
interface FormState {
  formConfig: DynamicFormConfig | null
  markdownContent: string
  selectedTemplate: string
  isGenerating: boolean
}

const DynamicFormTestPage: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [formState, setFormState] = useState<FormState>({
    formConfig: null,
    markdownContent: "",
    selectedTemplate: "",
    isGenerating: false,
  })

  // 模板管理
  const {
    items: templates,
    load: loadTemplates,
    create: createTemplate,
    getDetail: getTemplateDetail,
  } = useMetadata<{
    config: DynamicFormConfig
    type: "official" | "custom"
    name: string
  }>("template")

  // 加载模板
  React.useEffect(() => {
    loadTemplates()
  }, [])

  // 处理模板选择
  const handleTemplateChange = async (templateId: string) => {
    try {
      if (!templateId) {
        setFormState((prev) => ({ ...prev, formConfig: null }))
        return
      }

      const template = await getTemplateDetail(templateId)
      if (template && template.data.config) {
        setFormState((prev) => ({
          ...prev,
          formConfig: template.data.config,
          selectedTemplate: templateId,
        }))
        message.success("模板加载成功")
      }
    } catch (error) {
      console.error("加载模板错误:", error)
      message.error("加载模板失败")
    }
  }

  // 处理AI命令
  const handleCommand = useCallback(async (command: string) => {
    if (!command.trim()) return

    setFormState((prev) => ({ ...prev, isGenerating: true }))
    try {
      message.success("表单生成成功")
      setActiveTab("preview")
    } catch (error) {
      console.error("生成表单失败:", error)
      message.error("生成表单失败")
    } finally {
      setFormState((prev) => ({ ...prev, isGenerating: false }))
    }
  }, [])

  // 保存模板
  const handleSaveTemplate = async () => {
    if (!formState.formConfig) {
      message.error("请先生成表单")
      return
    }

    try {
      const templateData = {
        title: "新建模板", // 这里可以添加模板名称输入
        type: "custom",
        status: "active",
        data: {
          config: formState.formConfig,
          type: "custom",
          name: "新建模板",
        },
      }

      await createTemplate(templateData)
      message.success("模板保存成功")
      loadTemplates()
    } catch (error) {
      console.error("保存模板失败:", error)
      message.error("保存模板失败")
    }
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
            <Button onClick={handleSaveTemplate} disabled={!formState.formConfig}>
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
                {formState.formConfig ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='border rounded-lg p-6'
                  >
                    <DynamicForm config={formState.formConfig} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='text-center py-12 text-gray-500'
                  >
                    <Icon icon='mdi:form' className='w-12 h-12 mx-auto mb-4' />
                    <p>请先生成或选择一个表单模板</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value='markdown'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <pre className='whitespace-pre-wrap'>{formState.markdownContent || "暂无生成内容"}</pre>
              </div>
            </TabsContent>
          </Tabs>

          <div className='mt-6 space-y-4'>
            <Select
              label='选择模板'
              placeholder='请选择模板'
              value={formState.selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <SelectItem key='' value=''>
                不使用模板
              </SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title}
                </SelectItem>
              ))}
            </Select>

            <CommandInput disabled={formState.isGenerating} onCommand={handleCommand} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicFormTestPage
