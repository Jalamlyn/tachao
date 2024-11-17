import { aiLog } from "./AITraceLogger"

export type Environment = 'wechat' | 'wecom' | 'browser'

/**
 * 检查当前运行环境
 * @returns 返回当前环境类型
 */
export const checkEnvironment = (): Environment => {
  aiLog.log('开始检查运行环境')
  
  try {
    const ua = navigator.userAgent.toLowerCase()
    
    // 检查是否在微信环境
    if (ua.match(/micromessenger/i)) {
      // 进一步检查是否是企业微信
      if (ua.match(/wxwork/i)) {
        aiLog.log('检测到企业微信环境')
        return 'wecom'
      }
      aiLog.log('检测到微信环境')
      return 'wechat'
    }
    
    aiLog.log('检测到普通浏览器环境')
    return 'browser'
  } catch (error) {
    aiLog.log('环境检查出错', { error })
    return 'browser' // 默认返回浏览器环境
  }
}

/**
 * 获取当前环境的显示名称
 * @param env 环境类型
 * @returns 环境名称
 */
export const getEnvironmentName = (env: Environment): string => {
  const names = {
    wechat: '微信',
    wecom: '企业微信',
    browser: '浏览器'
  }
  return names[env]
}