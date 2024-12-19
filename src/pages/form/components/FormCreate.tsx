import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { FormHeader } from "./FormHeader"
import { useMetadata } from "@/hooks/useMetadata"
import { parseFormConfig } from "@/utils/codeParser"
import { Icon } from "@iconify/react"
import { ScrollShadow, Spinner } from "@nextui-org/react"
import { DynamicComponentRenderer } from "@/components/DynamicComponentRenderer"

const FormCreate: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedConfig, setLoadedConfig] = useState<any>(null)
  const [componentCode, setComponentCode] = useState<string | null>(null)
  const { templateId } = useParams<any>()
  const { getDetail } = useMetadata<{ config: any }>("template")

  useEffect(() => {
    const loadFormConfig = async () => {
      if (!templateId) return
      setIsLoading(true)
      setError(null)
      try {
        const result = await getDetail(templateId)
        if (result && result.data.rawConfig) {
          const { config, code } = await parseFormConfig(result.data.rawConfig)
          if (!config.metadata) {
            config.metadata = {
              title: result.title,
            }
          }
          setLoadedConfig(config)
          if (code) {
            setComponentCode(code)
          }
        }
      } catch (err) {
        console.error("加载表单配置失败:", err)
        setError("加载表单配置失败")
      } finally {
        setIsLoading(false)
      }
    }
    loadFormConfig()
  }, [])

  const renderContent = () => {
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
      <>
        <FormHeader title={loadedConfig?.metadata?.title || "创建表单"} formId={templateId} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='container mx-auto py-8 px-4'
        >
          <ScrollShadow className='h-[calc(100vh-60px)] mt-6'>
            {componentCode ? (
              <DynamicComponentRenderer code={componentCode} templateId={templateId} isCreateMode={true} />
            ) : (
              <div className='flex flex-col items-center justify-center'>
                <Icon icon='mdi:form' className='w-20 h-20 text-default-400 mb-6' />
                <p className='text-xl font-medium text-default-600 mb-2'>开始创建表单</p>
                <p className='text-default-500'>请先生成表单模板来预览</p>
              </div>
            )}
          </ScrollShadow>
        </motion.div>
      </>
    )
  }

  return renderContent()
}

export default FormCreate
