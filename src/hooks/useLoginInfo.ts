import { useState, useCallback, useEffect } from 'react'
import { LoginInfo, LoginState } from '@/types/login'
import { modelBaseUserToken } from '@/service/apis/api'
import { getCurrentAccountInfo } from '@/service/apis/user'
import { checkWxAuth } from '@/service/apis/wx'
import { aiLog } from '@/utils/AITraceLogger'

const STORAGE_KEY = 'login_info'

export const useLoginInfo = (): LoginState => {
  const [loginInfo, setLoginInfoState] = useState<LoginInfo>(() => {
    // 从localStorage初始化登录信息
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { type: 'none' }
  })

  // 保存登录信息到localStorage
  const setLoginInfo = useCallback((info: LoginInfo) => {
    aiLog.log('设置登录信息', { info })
    setLoginInfoState(info)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
  }, [])

  // 清除登录信息
  const clearLoginInfo = useCallback(() => {
    aiLog.log('清除登录信息')
    setLoginInfoState({ type: 'none' })
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(modelBaseUserToken)
  }, [])

  // 初始化时检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      aiLog.log('检查登录状态')
      
      try {
        // 检查平台token
        const token = localStorage.getItem(modelBaseUserToken)
        if (token) {
          debugger
          const userInfo = await getCurrentAccountInfo()
          setLoginInfo({
            type: 'platform',
            userInfo: {
              name: userInfo.name || userInfo.email,
              id: userInfo.id,
            },
            token
          })
          return
        }

        // 检查微信登录
        const wxUserInfo = checkWxAuth()
        if (wxUserInfo) {
          setLoginInfo({
            type: 'wechat',
            userInfo: {
              name: wxUserInfo.nickname,
              avatar: wxUserInfo.headimgurl,
              ...wxUserInfo
            }
          })
          return
        }

        // 未登录状态
        setLoginInfo({ type: 'none' })
      } catch (error) {
        aiLog.log('检查登录状态出错', { error })
        setLoginInfo({ type: 'none' })
      }
    }

    checkLoginStatus()
  }, [setLoginInfo])

  return {
    loginInfo,
    setLoginInfo,
    clearLoginInfo,
    isLoggedIn: loginInfo.type !== 'none'
  }
}