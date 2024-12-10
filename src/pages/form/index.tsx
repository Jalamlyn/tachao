import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useLoginInfo } from "@/hooks/useLoginInfo"
import { checkEnvironment } from "@/utils/environment"
import { aiLog } from "@/utils/AITraceLogger"
import { useFormState } from "./hooks/useFormState"
import { useAuthFlow } from "./hooks/useAuthFlow"
import { useFormData } from "./hooks/useFormData"
import { FormError } from "./components/FormError"
import { FormLoading } from "./components/FormLoading"
import { UserInfo } from "./components/UserInfo"
import { FormTabs } from "./components/FormTabs"

// 配置微信appId
const WX_APP_ID = import.meta.env.VITE_WX_APP_ID || "wxd792f04d6c8ca1be"

const NewForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>()
  const [formState, formActions] = useFormState()
  const { authState, handleWxAuth, handleWecomAuth } = useAuthFlow()
  const { loadFormData } = useFormData()
  const { loginInfo } = useLoginInfo()
  const [selectedTab, setSelectedTab] = useState("form")
  const [authRetrying, setAuthRetrying] = useState(false)

  useEffect(() => {
    const initializeForm = async () => {
      const traceId = aiLog.start()
      if (!formId) {
        formActions.setError("表单ID不能为空")
        return
      }

      formActions.setLoading()

      try {
        // 处理授权
        if (loginInfo.type === "none") {
          const env = checkEnvironment()
          if (env === "wechat") {
            const isAuthorized = await handleWxAuth(WX_APP_ID, formId)
            if (!isAuthorized) {
              aiLog.log("等待微信授权，暂停加载表单")
              return
            }
          } else if (env === "wecom") {
            const isAuthorized = await handleWecomAuth(formId)
            if (!isAuthorized) {
              aiLog.log("等待企业微信授权，暂停加载表单")
              return
            }
          }
        }

        // 加载表单数据
        const data = await loadFormData(formId)
        formActions.setSuccess(data)
      } catch (error) {
        formActions.setError(error instanceof Error ? error.message : "加载表单数据失败")
      }
    }

    if (!authRetrying) {
      initializeForm()
    }
  }, [formId, loginInfo.type, authRetrying])

  const handleRetry = () => {
    setAuthRetrying(true)
    formActions.reset()
    const env = checkEnvironment()
    if (env === "wechat") {
      handleWxAuth(WX_APP_ID, formId!)
    } else if (env === "wecom") {
      handleWecomAuth(formId!)
    }
    setAuthRetrying(false)
  }

  if (formState.status === "loading") {
    return <FormLoading />
  }

  if (formState.status === "error") {
    return <FormError error={formState.error!} onRetry={handleRetry} showRetry={formState.error?.includes("授权")} />
  }

  if (formState.status === "success" && (!formState.formConfig || !formState.formData)) {
    return <FormError error='未找到表单配置或数据' />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='container mx-auto py-8 px-4'
    >
      <div className='max-w-[1200px] mx-auto relative'>
        {loginInfo.type !== "none" && (
          <div className='absolute top-1 right-0'>
            <UserInfo userInfo={loginInfo.userInfo!} type={loginInfo.type} />
          </div>
        )}

        <FormTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          formConfig={formState.formConfig}
          formData={formState.formData}
          formId={formId!}
          templateId={formState.templateId}
          isCreateMode={false}
        />
      </div>
    </motion.div>
  )
}

export default NewForm