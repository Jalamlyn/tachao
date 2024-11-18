import { apiService } from "./api"
import { aiLog } from "@/utils/AITraceLogger"

// 企业微信配置
const WECOM_CONFIG = {
  CORPID: import.meta.env.VITE_WECOM_CORPID || '',
  AGENTID: import.meta.env.VITE_WECOM_AGENTID || '',
  APP_CODE: import.meta.env.VITE_WECOM_APP_CODE || 'workOrderManage'
}

/**
 * 生成企业微信网页授权链接
 * @param redirectUri 授权后重定向的回调链接地址
 * @param state 重定向后会带上state参数
 * @returns 完整的授权URL
 */
export const generateWecomAuthUrl = (
  redirectUri: string,
  state: string = 'STATE'
): string => {
  aiLog.log('生成企业微信授权URL', { redirectUri, state })
  
  const params = new URLSearchParams({
    appid: WECOM_CONFIG.CORPID,
    redirect_uri: encodeURIComponent(redirectUri),
    response_type: 'code',
    scope: 'snsapi_base',
    state: state,
    agentid: WECOM_CONFIG.AGENTID,
  })

  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`
  aiLog.log('生成的企业微信授权URL', { authUrl })
  
  return authUrl
}

/**
 * 企业微信登录
 * @param code 企业微信授权码
 * @returns 登录结果
 */
export const wecomLogin = async (code: string) => {
  aiLog.log('开始企业微信登录', { code })
  
  try {
    const response = await apiService.post('/public/api/wecom/login', {
      code,
      appCode: WECOM_CONFIG.APP_CODE
    })
    
    aiLog.log('企业微信登录成功', { response: response.data })
    return response.data
  } catch (error) {
    aiLog.log('企业微信登录失败', { error })
    throw error
  }
}

/**
 * 检查企业微信登录状态
 * @returns 已保存的用户信息或null
 */
export const checkWecomAuth = () => {
  aiLog.log('检查企业微信登录状态')
  
  const userInfoStr = localStorage.getItem('wecom_user_info')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      aiLog.log('已找到企业微信登录信息', { userInfo })
      return userInfo
    } catch (error) {
      aiLog.log('解析企业微信登录信息失败', { error })
      return null
    }
  }
  
  aiLog.log('未找到企业微信登录信息')
  return null
}

/**
 * 保存企业微信用户信息
 * @param userInfo 用户信息
 */
export const saveWecomUserInfo = (userInfo: any) => {
  aiLog.log('保存企业微信用户信息', { userInfo })
  localStorage.setItem('wecom_user_info', JSON.stringify(userInfo))
}

/**
 * 清除企业微信登录信息
 */
export const clearWecomAuth = () => {
  aiLog.log('清除企业微信登录信息')
  localStorage.removeItem('wecom_user_info')
}