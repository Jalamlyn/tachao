import React, { useState } from "react"
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

const DynamicFormTestPage: React.FC = () => {
  const [configInput, setConfigInput] = useState("")
  const [formConfig, setFormConfig] = useState<any>(null)
  const [templateType, setTemplateType] = useState<"official" | "custom">("custom")
  const [templateName, setTemplateName] = useState("")
  
  // 使用新的 useMetadata hook 来管理模板
  const { create: createTemplate } = useMetadata<{
    config: any
    type: "official" | "custom"
    name: string
  }>("template")

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigInput(e.target.value)
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
        }
      }

      const result = await createTemplate(templateData)
      
      if (result) {
        message.success("表单模板保存成功")
        setTemplateName("")
      } else {
        message.error("保存失败")
      }
    } catch (error) {
      console.error("保存模板错误:", error)
      message.error("保存模板失败")
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