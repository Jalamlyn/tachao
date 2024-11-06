import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Spinner } from "@nextui-org/react"
import { useMetadata } from "@/components/from-templates/hook/useMetadata"
import DynamicForm from "@/components/common/DynamicForm"
import message from "@/components/Message"
import { motion } from "framer-motion"

const Form: React.FC = () => {
  const { formId } = useParams<{ formId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formConfig, setFormConfig] = useState<any>(null)
  const [templateId, setTemplateId] = useState<string | null>(null)
  
  const { getDetail: getFormDetail } = useMetadata("form")
  const { getDetail: getTemplateDetail } = useMetadata("template")

  useEffect(() => {
    const loadFormData = async () => {
      if (!formId) {
        setError("表单ID不能为空")
        setIsLoading(false)
        return
      }

      try {
        // 获取表单详情
        const formDetail = await getFormDetail(formId)
        if (!formDetail) {
          throw new Error("未找到表单数据")
        }

        // 获取模板ID
        const formTemplateId = formDetail.templateId
        if (!formTemplateId) {
          throw new Error("未找到模板ID")
        }
        setTemplateId(formTemplateId)

        // 获取模板配置
        const template = await getTemplateDetail(formTemplateId)
        if (!template || !template.data.config) {
          throw new Error("未找到模板配置")
        }

        // 设置表单配置
        setFormConfig({
          ...template.data.config,
          formId,
          templateId: formTemplateId,
          data: formDetail.data || {}, // 使用表单数据填充
        })
      } catch (err) {
        console.error("加载表单数据失败:", err)
        setError(err instanceof Error ? err.message : "加载表单数据失败")
        message.error("加载表单数据失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadFormData()
  }, [formId, getFormDetail, getTemplateDetail])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="加载中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-danger">
        <p className="text-xl font-bold mb-2">错误</p>
        <p>{error}</p>
      </div>
    )
  }

  if (!formConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>未找到表单配置</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="max-w-[1200px] mx-auto">
        <DynamicForm
          config={formConfig}
          formId={formId}
          templateId={templateId || undefined}
        />
      </div>
    </motion.div>
  )
}

export default Form