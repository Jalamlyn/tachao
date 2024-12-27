import React, { useState, useEffect } from "react"
import { Spinner } from "@nextui-org/react"
import { DynamicComponentRenderer } from "../DynamicComponentRenderer"
import { getMetadata } from "@/service/apis/metadata"
import message from "../Message"

interface FormRendererWrapperProps {
  templateId: string // 必需，表单模板ID
  formId?: string // 可选，具体表单实例ID
}

export const FormRendererWrapper: React.FC<FormRendererWrapperProps> = ({ templateId, formId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templateData, setTemplateData] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 1. 获取模板数据
        const templateResult = await getMetadata([templateId])
        if (!templateResult.data?.[0]?.value) {
          throw new Error("表单模板不存在")
        }
        const template = JSON.parse(templateResult.data[0].value)
        setTemplateData(template.data.rawConfig)

        // 2. 如果提供了 formId，获取表单实例数据
        if (formId) {
          const formResult = await getMetadata([formId])
          if (formResult.data?.[0]?.value) {
            const form = JSON.parse(formResult.data[0].value)
            setFormData(form.data)
          }
        }
      } catch (err) {
        console.error("Error loading form template:", err)
        setError(err instanceof Error ? err.message : "加载失败")
        message.error("加载表单模板失败")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [templateId, formId])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 bg-danger-50 rounded-lg'>
        <p className='text-danger'>{error}</p>
      </div>
    )
  }

  if (!templateData) {
    return null
  }

  return (
    <DynamicComponentRenderer
      code={templateData}
      formData={formData} // 可能为 null，表示新建表单
      templateId={templateId}
      formId={formId} // 可能为 undefined，表示新建表单
    />
  )
}
