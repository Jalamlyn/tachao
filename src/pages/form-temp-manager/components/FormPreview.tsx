import React, { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import DynamicForm from "@/components/common/DynamicForm"
import type { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { useMetadata } from "@/hooks/useMetadata"
import { parseFormConfig } from "@/utils/codeParser"
import { Icon } from "@iconify/react"
import { Spinner } from "@nextui-org/react"

interface FormPreviewProps {
  config: DynamicFormConfig | null
  previewMode?: boolean
}

const FormPreview: React.FC<FormPreviewProps> = ({ config: propConfig, previewMode = false }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedConfig, setLoadedConfig] = useState<DynamicFormConfig | null>(null)
  const { templateId } = useParams<any>()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const isCreateMode = params.get("mode") === "create"
  const { getDetail } = useMetadata<{ config: DynamicFormConfig }>("template")

  useEffect(() => {
    const loadFormConfig = async () => {
      if (propConfig) {
        setLoadedConfig(propConfig)
        return
      }

      if (templateId) {
        setIsLoading(true)
        setError(null)
        try {
          const result = await getDetail(templateId)
          if (result && result.data.rawConfig) {
            const { config } = await parseFormConfig(result.data.rawConfig)
            if (!config.metadata) {
              config.metadata = {
                title: result.title,
              }
            }
            setLoadedConfig(config)
          } else {
            // setError("未找到表单配置")
          }
        } catch (err) {
          console.error("加载表单配置失败:", err)
          setError("加载表单配置失败")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadFormConfig()
  }, [templateId, propConfig, getDetail])

  const config = propConfig || loadedConfig

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <Spinner
          label='加载中...'
          classNames={{
            wrapper: "w-12 h-12",
            label: "text-xl font-medium text-default-600 mt-4",
          }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-danger-50 rounded-xl p-8 text-center'>
        <Icon icon='mdi:alert-circle' className='w-16 h-16 text-danger mb-4' />
        <p className='text-xl font-medium text-danger'>{error}</p>
      </div>
    )
  }

  return (
    <div className='relative h-full bg-background'>
      {config ? (
        <div className='h-full'>
          <div className='max-w-[1200px] mx-auto pt-2 bg-white h-screen'>
            <DynamicForm isCreateMode={true} previewMode={!isCreateMode} config={config} templateId={templateId} />
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-full bg-default-50'>
          <Icon icon='mdi:form' className='w-20 h-20 text-default-400 mb-6' />
          <p className='text-xl font-medium text-default-600 mb-2'>开始创建表单</p>
          <p className='text-default-500'>请先生成表单模板来预览</p>
        </div>
      )}
    </div>
  )
}

export default FormPreview
