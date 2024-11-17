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
import { generateWxAuthUrl, getWxUserInfo, checkWxAuth, saveWxUserInfo } from "@/service/apis/wx"
import { aiLog } from "@/utils/AITraceLogger"

// 配置微信appId
const WX_APP_ID = process.env.REACT_APP_WX_APP_ID || 'your_app_id'

const Form: React.FC = () => {
  const { formId } = useParams<{ formId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formConfig, setFormConfig] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("form")

  const { getDetail: getFormDetail } = useMetadata("form")
  const { getDetail: getTemplateDetail } = useMetadata("template")

  // 处理微信授权
  const handleWxAuth = async () => {
    const traceId = aiLog.start()
    aiLog.log('开始处理微信授权', { formId })

    try {
      const code = new URLSearchParams(window.location.search).get('code')
      
      // 检查是否已经授权
      const existingAuth = checkWxAuth()
      if (existingAuth) {
        aiLog.log('已有微信授权信息', { userInfo: existingAuth })
        return true
      }

      // 如果有code，获取用户信息
      if (code) {
        aiLog.log('检测到授权code，开始获取用户信息', { code })
        try {
          const userInfo = await getWxUserInfo(WX_APP_ID, code)
          saveWxUserInfo(userInfo)
          // 清除URL中的code参数
          const cleanUrl = window.location.href.split('?')[0]
          window.history.replaceState({}, document.title, cleanUrl)
          aiLog.log('微信授权成功', { userInfo })
          return true
        } catch (error) {
          aiLog.log('获取微信用户信息失败', { error })
          message.error('微信授权失败，请重试')
          return false
        }
      }

      // 需要进行授权
      aiLog.log('需要进行微信授权')
      const currentUrl = `${window.location.origin}/form/${formId}`
      const authUrl = generateWxAuthUrl(WX_APP_ID, currentUrl, 'snsapi_userinfo', formId)
      window.location.href = authUrl
      return false
    } catch (error) {
      aiLog.log('微信授权处理失败', { error })
      message.error('微信授权处理失败')
      return false
    }
  }

  useEffect(() => {
    const loadFormData = async () => {
      const traceId = aiLog.start()
      if (!formId) {
        aiLog.log("[Form] No formId provided")
        setError("表单ID不能为空")
        setIsLoading(false)
        return
      }

      try {
        // 首先进行微信授权
        const isAuthorized = await handleWxAuth()
        if (!isAuthorized) {
          aiLog.log('等待微信授权，暂停加载表单')
          return
        }

        aiLog.log("[Form] Start loading form data for formId:", formId)
        // 获取表单详情
        const formDetail = await getFormDetail(formId)
        aiLog.log("[Form] Form detail loaded:", formDetail)

        if (!formDetail) {
          aiLog.log("[Form] Form detail not found")
          throw new Error("未找到表单数据")
        }

        // 保存表单数据
        setFormData(formDetail.data)

        // 获取模板ID
        const formTemplateId = formDetail.templateId
        aiLog.log("[Form] Template ID from form:", formTemplateId)

        if (!formTemplateId) {
          aiLog.log("[Form] No template ID found in form detail")
          throw new Error("未找到模板ID")
        }
        setTemplateId(formTemplateId)

        // 获取模板配置
        aiLog.log("[Form] Loading template detail for templateId:", formTemplateId)
        const template = await getTemplateDetail(formTemplateId)
        aiLog.log("[Form] Template detail loaded:", template)
        const { config } = await parseFormConfig(template.data.rawConfig)
        if (!template || !config) {
          aiLog.log("[Form] Template config not found")
          throw new Error("未找到模板配置")
        }

        // 设置表单配置
        const newFormConfig = {
          ...config,
          formId,
          templateId: formTemplateId,
        }
        aiLog.log("[Form] Setting form config:", newFormConfig)
        setFormConfig(newFormConfig)
      } catch (err) {
        aiLog.log("[Form] Error loading form data:", err)
        setError(err instanceof Error ? err.message : "加载表单数据失败")
        message.error("加载表单数据失败")
      } finally {
        aiLog.log("[Form] Form loading completed")
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
                initialValues={formData}
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