import { apiService } from "./api"
import { aiLog } from "@/utils/AITraceLogger"

// 微信用户信息接口
interface WxUserInfo {
  openid: string
  nickname?: string
  sex?: number
  province?: string
  city?: string
  country?: string
  headimgurl?: string
  privilege?: string[]
  unionid?: string
}

/**
 * 生成微信授权URL
 * @param appId 微信公众号的appId
 * @param redirectUri 授权后重定向的回调链接地址
 * @param scope 应用授权作用域，snsapi_base或snsapi_userinfo
 * @param state 重定向后会带上state参数，开发者可以填写任意参数值，最多128字节
 * @returns 完整的微信授权URL
 */
export const generateWxAuthUrl = (
  appId: string,
  redirectUri: string,
  scope: "snsapi_base" | "snsapi_userinfo" = "snsapi_userinfo",
  state: string = "STATE"
) => {
  aiLog.log("生成微信授权URL", { appId, redirectUri, scope, state })
  const encodedRedirectUri = encodeURIComponent(redirectUri)
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
  aiLog.log("生成的授权URL", { authUrl })
  return authUrl
}

/**
 * 获取微信用户信息
 * @param appId 微信公众号的appId
 * @param code 微信授权后获取的code
 * @returns 用户信息
 */
export const getWxUserInfo = async (appId: string, code: string): Promise<WxUserInfo> => {
  const traceId = aiLog.start()
  aiLog.log("开始获取微信用户信息", { appId, code })

  try {
    const res = await apiService.get("/external/wx/mp/web/user-infos", {
      params: {
        appid: appId,
        code: code,
      },
    })
    aiLog.log("获取微信用户信息成功", { response: res.data })
    return res.data
  } catch (error) {
    aiLog.log("获取微信用户信息失败", { error })
    throw error
  }
}

/**
 * 检查微信授权状态
 * @returns 返回已保存的用户信息或null
 */
export const checkWxAuth = (): WxUserInfo | null => {
  aiLog.log("检查微信授权状态")
  const userInfoStr = localStorage.getItem("wx_user_info")
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      aiLog.log("已找到微信授权信息", { userInfo })
      return userInfo
    } catch (error) {
      aiLog.log("解析微信授权信息失败", { error })
      return null
    }
  }
  aiLog.log("未找到微信授权信息")
  return null
}

/**
 * 保存微信用户信息
 * @param userInfo 微信用户信息
 */
export const saveWxUserInfo = (userInfo: WxUserInfo): void => {
  aiLog.log("保存微信用户信息", { userInfo })
  localStorage.setItem("wx_user_info", JSON.stringify(userInfo))
}

/**
 * 清除微信授权信息
 */
export const clearWxAuth = (): void => {
  aiLog.log("清除微信授权信息")
  localStorage.removeItem("wx_user_info")
}
