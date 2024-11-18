/**
 * 登录类型
 */
export type LoginType = 'platform' | 'wechat' | 'wecom' | 'none'

/**
 * 用户信息接口
 */
export interface UserInfo {
  name?: string
  avatar?: string
  id?: string
  openid?: string
  nickname?: string
  headimgurl?: string
  [key: string]: any
}

/**
 * 登录信息接口
 */
export interface LoginInfo {
  type: LoginType
  userInfo?: UserInfo
  token?: string
}

/**
 * 登录状态接口
 */
export interface LoginState {
  loginInfo: LoginInfo
  setLoginInfo: (info: LoginInfo) => void
  clearLoginInfo: () => void
  isLoggedIn: boolean
}