import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Spinner, Tabs, Tab } from "@nextui-org/react"
import { useMetadata } from "@/hooks/useMetadata"
import DynamicForm from "@/components/common/DynamicForm"
import FormHistoryTable from "@/components/forms/FormHistoryTable"
import message from "@/components/Message"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react"
import { parseFormConfig } from "@/utils/codeParser"

const Form: React.FC = () => {
  const { formId } = useParams<{ formId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formConfig, setFormConfig] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null) // 新增 formData state
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("form")

  const { getDetail: getFormDetail } = useMetadata("form")
  const { getDetail: getTemplateDetail } = useMetadata("template")

  useEffect(() => {
    const loadFormData = async () => {
      if (!formId) {
        console.log("[Form] No formId provided")
        setError("表单ID不能为空")
        setIsLoading(false)
        return
      }

      try {
        console.log("[Form] Start loading form data for formId:", formId)
        // 获取表单详情
        const formDetail = await getFormDetail(formId)
        console.log("[Form] Form detail loaded:", formDetail)

        if (!formDetail) {
          console.log("[Form] Form detail not found")
          throw new Error("未找到表单数据")
        }

        // 保存表单数据
        setFormData(formDetail.data)

        // 获取模板ID
        const formTemplateId = formDetail.templateId
        console.log("[Form] Template ID from form:", formTemplateId)

        if (!formTemplateId) {
          console.log("[Form] No template ID found in form detail")
          throw new Error("未找到模板ID")
        }
        setTemplateId(formTemplateId)

        // 获取模板配置
        console.log("[Form] Loading template detail for templateId:", formTemplateId)
        const template = await getTemplateDetail(formTemplateId)
        console.log("[Form] Template detail loaded:", template)
        const { config } = await parseFormConfig(template.data.rawConfig)
        if (!template || !config) {
          console.log("[Form] Template config not found")
          throw new Error("未找到模板配置")
        }

        // 设置表单配置
        const newFormConfig = {
          ...config,
          formId,
          templateId: formTemplateId,
        }
        console.log("[Form] Setting form config:", newFormConfig)
        setFormConfig(newFormConfig)
      } catch (err) {
        console.error("[Form] Error loading form data:", err)
        setError(err instanceof Error ? err.message : "加载表单数据失败")
        message.error("加载表单数据失败")
      } finally {
        console.log("[Form] Form loading completed")
        setIsLoading(false)
      }
    }

    loadFormData()
  }, [formId, getFormDetail, getTemplateDetail])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner label='加载中...' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen text-danger'>
        <p className='text-xl font-bold mb-2'>错误</p>
        <p>{error}</p>
      </div>
    )
  }

  if (!formConfig || !formData) {
    return (
      <div className='flex items-center justify-center min-h-screen text-gray-500'>
        <p>未找到表单配置或数据</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='container mx-auto py-8 px-4'
    >
      <div className='max-w-[1200px] mx-auto'>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key.toString())}
          className='w-full'
          classNames={{
            tabList: "gap-2 sm:gap-4 relative rounded-xl p-1 sm:p-2 bg-gray-100/50 flex-wrap",
            cursor: "bg-white shadow-md",
            tab: "max-w-fit px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm",
            tabContent: "group-data-[selected=true]:text-blue-600",
          }}
        >
          <Tab
            key='form'
            title={
              <div className='flex items-center space-x-1 sm:space-x-2'>
                <Icon icon='mdi:form-select' className='w-4 h-4 sm:w-5 sm:h-5' />
                <span>表单内容</span>
              </div>
            }
          >
            <div className='mt-4 h-[calc(100vh-140px)] overflow-auto'>
              <DynamicForm
                config={formConfig}
                id={formId}
                templateId={templateId}
                initialValues={formData} // 直接传递 formData 作为初始值
              />
            </div>
          </Tab>
          <Tab
            key='history'
            title={
              <div className='flex items-center space-x-1 sm:space-x-2'>
                <Icon icon='mdi:history' className='w-4 h-4 sm:w-5 sm:h-5' />
                <span>修改记录</span>
              </div>
            }
          >
            <div className='mt-4'>
              <FormHistoryTable formId={formId} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </motion.div>
  )
}

export default Form
