import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectItem } from "@nextui-org/react"
import message from "@/components/Message"
import DynamicForm from "@/components/common/DynamicForm"
import { motion } from "framer-motion"
import { parseFormConfig } from "@/utils/codeParser"
import { warehouseReceiptConfig } from "./mock/warehouse-receipt"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import { Icon } from "@iconify/react"
import AIFormAgent from "@/service/agents/AIFormAgent"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { localDB } from "@/utils/localDB"

const LAST_GENERATED_KEY = "dynamic-form-last-generated"

const DynamicFormTestPage: React.FC = () => {
  const [configInput, setConfigInput] = useState("")
  const [formConfig, setFormConfig] = useState<DynamicFormConfig | null>(null)
  const [templateType, setTemplateType] = useState<"official" | "custom">("custom")
  const [templateName, setTemplateName] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [aiDescription, setAiDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingCode, setGeneratingCode] = useState("") // 新增状态用于存储生成过程
  const [aiGeneratedConfig, setAiGeneratedConfig] = useState<{
    config: DynamicFormConfig
    title: string
  } | null>(null)

  // 使用 useMetadata hook 来管理模板
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

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigInput(e.target.value)
  }

  const handleAIDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiDescription(e.target.value)
  }

  const handleGenerateAIForm = async () => {
    if (!aiDescription.trim()) {
      message.error("请输入表单描述")
      return
    }

    setIsGenerating(true)
    setGeneratingCode("") // 重置生成代码
    try {
      const result = await AIFormAgent.createForm(aiDescription, (chunk) => {
        console.log("AI Response Chunk:", chunk)
        setGeneratingCode((prev) => prev + chunk) // 实时更新生成的代码
      })

      if (result) {
        setAiGeneratedConfig(result)
        setFormConfig(result.config)
        setTemplateName(result.title)
        // 保存最新生成的结果到本地缓存
        localDB.setItem(LAST_GENERATED_KEY, {
          config: result.config,
          title: result.title,
          timestamp: new Date().toISOString(),
        })
        message.success("AI 生成表单成功")
      }
    } catch (error) {
      console.error("AI 生成表单失败:", error)
      message.error("AI 生成表单失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLoadLastGenerated = () => {
    try {
      const lastGenerated = localDB.getItem(LAST_GENERATED_KEY)
      if (lastGenerated) {
        setAiGeneratedConfig({
          config: lastGenerated.config,
          title: lastGenerated.title,
        })
        setFormConfig(lastGenerated.config)
        setTemplateName(lastGenerated.title)
        message.success("已加载最近一次生成的结果")
      } else {
        message.info("没有找到最近生成的结果")
      }
    } catch (error) {
      console.error("加载最近生成结果失败:", error)
      message.error("加载最近生成结果失败")
    }
  }

  const handleParseConfig = async () => {
    try {
      const parsedConfig = await parseFormConfig(configInput)
      if (parsedConfig) {
        setFormConfig(parsedConfig)
        message.success("配置解析成功")
      } else {
        message.error("配置解析失败")
      }
    } catch (error) {
      console.error("配置解析错误:", error)
      message.error("请检查输入的配置格式是否正确")
    }
  }

  const handleLoadExample = async () => {
    try {
      setConfigInput(warehouseReceiptConfig)
      const parsedConfig = await parseFormConfig(warehouseReceiptConfig)
      if (parsedConfig) {
        setFormConfig(parsedConfig)
        message.success("示例配置加载成功")
      } else {
        message.error("示例配置解析失败")
      }
    } catch (error) {
      console.error("加载示例配置错误:", error)
      message.error("加载示例配置失败")
    }
  }

  const handleSubmit = async (values: any) => {
    console.log("表单提交的值:", values)
    message.success("表单数据已打印到控制台")
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
        loadTemplates() // 重新加载模板列表
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
      <motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-8'>
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
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleGenerateAIForm} disabled={isGenerating} className='self-start gap-2'>
                      {isGenerating ? (
                        <Icon icon='mdi:loading' className='w-5 h-5 animate-spin' />
                      ) : (
                        <Icon icon='mdi:robot' className='w-5 h-5' />
                      )}
                      AI 生成
                    </Button>
                    <Button 
                      onClick={handleLoadLastGenerated} 
                      variant="outline" 
                      className='self-start gap-2'
                    >
                      <Icon icon='mdi:history' className='w-5 h-5' />
                      加载最近生成
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI 生成代码预览区域 */}
              {generatingCode && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>AI 生成过程</label>
                  <div className='relative'>
                    <pre className='p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-[400px] font-mono text-sm'>
                      <code>{generatingCode}</code>
                    </pre>
                    {isGenerating && (
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

              <div className='space-y-2'>
                <label className='text-sm font-medium'>表单配置</label>
                <div className='flex gap-2 mb-2'>
                  <Button onClick={handleLoadExample}>加载示例配置</Button>
                  <Button onClick={handleParseConfig}>解析配置</Button>
                </div>
                <Textarea
                  value={configInput}
                  onChange={handleConfigChange}
                  placeholder='请输入表单配置对象...'
                  className='min-h-[200px] font-mono'
                />
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

        {formConfig && (
          <motion.div variants={itemVariants} initial='hidden' animate='visible'>
            <Card className='bg-white'>
              <CardHeader>
                <CardTitle>表单预览</CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicForm config={formConfig} onSubmit={handleSubmit} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default DynamicFormTestPage