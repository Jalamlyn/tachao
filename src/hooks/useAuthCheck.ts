import { useState, useCallback, useEffect } from "react"
import { modelBaseUserToken } from "@/service/apis/api"
import { checkEnvironment } from "@/utils/environment"
import { checkWxAuth, handleWxAuth } from "@/service/apis/wx"
import { submitWaitList } from "@/service/apis/api"
import message from "@/components/Message"

// 配置微信appId
const WX_APP_ID = import.meta.env.VITE_WX_APP_ID || "wxd792f04d6c8ca1be"

interface UseAuthCheckOptions {
  formId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useAuthCheck = ({ formId, onSuccess, onError }: UseAuthCheckOptions) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  const checkAuth = useCallback(async () => {
    setIsChecking(true)
    try {
      // 1. 检查是否已登录
      const token = localStorage.getItem(modelBaseUserToken)
      if (token) {
        setIsAuthorized(true)
        onSuccess?.()
        return true
      }

      // 2. 检查环境
      const isWechat = checkEnvironment() === 'wechat'
      if (!isWechat) {
        // 非微信环境直接跳转登录
        window.location.href = '/login'
        return false
      }

      // 3. 微信环境处理流程
      // 检查是否已有微信授权
      const wxUserInfo = checkWxAuth()
      if (!wxUserInfo) {
        // 没有授权，开始微信授权流程
        await handleWxAuth(WX_APP_ID, formId)
        return false // 会跳转到微信授权页面
      }

      // 4. 检查是否已申请权限
      const waitlistData = {
        purpose: JSON.stringify({
          formId,
          userInfo: wxUserInfo,
          type: 'form_access'
        })
      }
      await submitWaitList(waitlistData)
      // 显示申请提交成功提示
      message.success('已提交访问申请，请等待审核')

      // 所有检查通过
      setIsAuthorized(true)
      onSuccess?.()
      return true
    } catch (error) {
      onError?.(error as Error)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [formId, onSuccess, onError])

  // 组件挂载时执行检查
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    isChecking,
    isAuthorized,
    checkAuth
  }
}

export const withAuthCheck = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const formId = props.formId || props.templateId
    const { isChecking, isAuthorized } = useAuthCheck({
      formId,
      onError: (error) => {
        message.error(error.message)
      }
    })

    if (isChecking) {
      return <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='text-xl font-medium mb-2'>正在检查访问权限...</div>
          <div className='text-gray-500'>请稍候</div>
        </div>
      </div>
    }

    if (!isAuthorized) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}