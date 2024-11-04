import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectItem } from "@nextui-org/react"
import message from "@/components/Message"
import DynamicForm from "@/components/common/DynamicForm"
import { motion, AnimatePresence } from "framer-motion"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { merge, cloneDeep } from 'lodash'
import AIFormAgent from "@/service/agents/AIFormAgent"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import { Icon } from "@iconify/react"

const DynamicFormTestPage: React.FC = () => {
  const [formConfig, setFormConfig] = useState<DynamicFormConfig | null>(null)
  const [templateType, setTemplateType] = useState<"official" | "custom">("custom")
  const [templateName, setTemplateName] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [aiDescription, setAiDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [generatingCode, setGeneratingCode] = useState("")
  const [aiGeneratedConfig, setAiGeneratedConfig] = useState<{
    config: DynamicFormConfig
    title: string
  } | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [formKey, setFormKey] = useState(0)

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

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleAIDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiDescription(e.target.value)
  }

  const handleEditDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditDescription(e.target.value)
  }

  const handleGenerateAIForm = async () => {
    if (!aiDescription.trim()) {
      message.error("请输入表单描述")
      return
    }

    setIsGenerating(true)
    setGeneratingCode("")
    try {
      const result = await AIFormAgent.createForm(aiDescription, (chunk) => {
        console.log("AI Response Chunk:", chunk)
        setGeneratingCode((prev) => prev + chunk)
      })
      if (result) {
        setAiGeneratedConfig(result)
        setFormConfig(result.config)
        setTemplateName(result.title)
        setFormKey(prev => prev + 1)
        message.success("AI 生成表单成功")
      }
    } catch (error) {
      console.error("AI 生成表单失败:", error)
      message.error("AI 生成表单失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditAIForm = async () => {
    if (!editDescription.trim()) {
      message.error("请输入编辑描述")
      return
    }

    if (!formConfig) {
      message.error("请先生成或加载表单配置")
      return
    }

    setIsEditing(true)
    setGeneratingCode("")
    try {
      const result = await AIFormAgent.editForm(formConfig, editDescription, (chunk) => {
        console.log("AI Response Chunk:", chunk)
        setGeneratingCode((prev) => prev + chunk)
      })
      
      if (result) {
        const mergedConfig = merge(cloneDeep(formConfig), result.config)
        setFormConfig(mergedConfig)
        setFormKey(prev => prev + 1)
        
        if (result.title) {
          setTemplateName(result.title)
        }
        
        message.success("AI 编辑表单成功")
        setEditDescription("") 
      }
    } catch (error) {
      console.error("AI 编辑表单失败:", error)
      message.error("AI 编辑表单失败，请重试")
    } finally {
      setIsEditing(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!formConfig) {
      message.error("请先解析表单配置")
      return
    }

    if (!templateName.trim()) {
      message.error("请输入表单模板名称")
      return
    }

    try {
      const templateData = {
        title: templateName,
        type: templateType,
        status: "active",
        data: {
          config: formConfig,
          type: templateType,
          name: templateName,
        },
      }

      const result = await createTemplate(templateData)

      if (result) {
        message.success("表单模板保存成功")
        setTemplateName("")
        loadTemplates()
      } else {
        message.error("保存失败")
      }
    } catch (error) {
      console.error("保存模板错误:", error)
      message.error("保存模板失败")
    }
  }

  const handleTemplateChange = async (templateId: string) => {
    try {
      setSelectedTemplateId(templateId)
      if (!templateId) {
        setFormConfig(null)
        return
      }

      const template = await getTemplateDetail(templateId)
      if (template && template.data.config) {
        setFormConfig(template.data.config)
        setFormKey(prev => prev + 1)
        message.success("模板加载成功")
      } else {
        message.error("模板加载失败")
      }
    } catch (error) {
      console.error("加载模板错误:", error)
      message.error("加载模板失败")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className='container mx-auto py-8'>
      <motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-8 bg-white'>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>动态表单测试</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* AI 生成表单部分 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>AI 生成表单</label>
                <div className='flex gap-2'>
                  <Textarea
                    value={aiDescription}
                    onChange={handleAIDescriptionChange}
                    placeholder='请输入表单描述，AI 将根据描述生成表单配置...'
                    className='flex-1'
                  />
                  <Button onClick={handleGenerateAIForm} disabled={isGenerating} className='self-start gap-2'>
                    {isGenerating ? (
                      <Icon icon='mdi:loading' className='w-5 h-5 animate-spin' />
                    ) : (
                      <Icon icon='mdi:robot' className='w-5 h-5' />
                    )}
                    AI 生成
                  </Button>
                </div>
              </div>

              {/* AI 编辑表单部分 */}
              {formConfig && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>AI 编辑表单</label>
                  <div className='flex gap-2'>
                    <Textarea
                      value={editDescription}
                      onChange={handleEditDescriptionChange}
                      placeholder='请输入编辑描述，AI 将根据描述修改当前表单...'
                      className='flex-1'
                    />
                    <Button 
                      onClick={handleEditAIForm} 
                      disabled={isEditing} 
                      className='self-start gap-2'
                      variant='secondary'
                    >
                      {isEditing ? (
                        <Icon icon='mdi:loading' className='w-5 h-5 animate-spin' />
                      ) : (
                        <Icon icon='mdi:pencil' className='w-5 h-5' />
                      )}
                      AI 编辑
                    </Button>
                  </div>
                </div>
              )}

              {/* AI 生成代码预览区域 */}
              {generatingCode && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>AI 生成过程</label>
                  <div className='relative'>
                    <pre className='p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-[400px] font-mono text-sm'>
                      <code>{generatingCode}</code>
                    </pre>
                    {(isGenerating || isEditing) && (
                      <div className='absolute bottom-4 right-4'>
                        <Icon icon='mdi:loading' className='w-5 h-5 animate-spin text-blue-500' />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 模板选择 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>选择模板</label>
                <Select
                  label='选择已保存的模板'
                  placeholder='请选择模板'
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <SelectItem key='' value=''>
                    不使用模板
                  </SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title} ({template.data.type})
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {formConfig && (
                <div className='space-y-4 pt-4 border-t'>
                  <div className='flex gap-4 items-end'>
                    <div className='flex-1'>
                      <label className='text-sm font-medium mb-2 block'>模板名称</label>
                      <input
                        type='text'
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder='请输入模板名称'
                        className='w-full px-3 py-2 border rounded-md'
                      />
                    </div>
                    <Select
                      label='模板类型'
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value as "official" | "custom")}
                      className='w-48'
                    >
                      <SelectItem key='official' value='official'>
                        官方模板
                      </SelectItem>
                      <SelectItem key='custom' value='custom'>
                        自定义模板
                      </SelectItem>
                    </Select>
                    <Button onClick={handleSaveTemplate} className='gap-2'>
                      <Icon icon='mdi:content-save' className='w-4 h-4' />
                      保存为模板
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode='wait'>
          {formConfig && (
            <motion.div variants={itemVariants} initial='hidden' animate='visible' exit='hidden' key='form-preview'>
              <Card className='bg-white'>
                <CardHeader>
                  <CardTitle>表单预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <DynamicForm key={formKey} config={formConfig} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default DynamicFormTestPage