import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context

class UserService {
  static SESSION_KEY = `${appId}_session`
  static TOKEN_KEY = `${appId}_token`
  static USER_KEY = `${appId}_user`

  constructor() {
    // 监听存储事件，实现多标签页同步
    window.addEventListener("storage", this.handleStorageChange)
  }

  handleStorageChange = (event) => {
    if (event.key === UserService.TOKEN_KEY && !event.newValue) {
      // 其他标签页登出，同步登出当前页面
      this.clearSession()
      window.location.reload()
    }
  }

  async register(phone, password) {
    try {
      api.log.info("开始用户注册", { phone })

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        throw new Error("手机号格式不正确")
      }

      const result = await api.cloudRegister({
        phone,
        password,
      })

      if (!result?.userId) {
        throw new Error("注册失败，请稍后重试")
      }

      api.log.info("用户注册成功", {
        userId: result.userId,
        phone,
      })

      return result
    } catch (error) {
      api.log.error("用户注册失败", {
        phone,
        error: error.message,
      })
      throw new Error(error.message || "注册失败，请稍后重试")
    }
  }

  async login(phone, password) {
    try {
      api.log.info("开始用户登录", { phone })

      if (!phone || !password) {
        throw new Error("手机号和密码不能为空")
      }

      const response = await api.cloudLogin({
        phone,
        password,
      })

      api.log.info("登录接口调用成功，开始处理返回数据", {
        hasData: !!response?.data,
        recordsLength: response?.data?.records?.length,
      })

      if (!response?.data?.records || !Array.isArray(response.data.records)) {
        throw new Error("登录失败，服务器返回数据格式错误")
      }

      const userRecord = response.data.records[0]

      if (!userRecord) {
        throw new Error("用户不存在或密码错误")
      }

      // 转换数据结构
      const userData = {
        userId: userRecord._id,
        phone: userRecord.sjh,
        token: userRecord._openid,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
      }

      // 保存会话信息
      this.saveSession(userData)

      api.log.info("用户登录成功，数据已保存到本地存储", {
        userId: userData.userId,
        phone: userData.phone,
      })

      return {
        user: userData,
        userId: userData.userId,
        token: userData.token,
      }
    } catch (error) {
      api.log.error("用户登录失败", {
        phone,
        error: error.message,
      })
      throw new Error(error.message || "手机号或密码错误")
    }
  }

  async logout() {
    try {
      api.log.info("开始用户登出")
      this.clearSession()
      api.log.info("用户登出成功，已清除本地存储")
    } catch (error) {
      api.log.error("用户登出失败", {
        error: error.message,
      })
      throw new Error("登出失败，请稍后重试")
    }
  }

  saveSession(userData) {
    try {
      localStorage.setItem(UserService.TOKEN_KEY, userData.token)
      localStorage.setItem(UserService.USER_KEY, JSON.stringify(userData))
      localStorage.setItem(
        UserService.SESSION_KEY,
        JSON.stringify({
          userId: userData.userId,
          token: userData.token,
          timestamp: Date.now(),
        })
      )

      api.log.info("会话信息保存成功")
    } catch (error) {
      api.log.error("保存会话信息失败", {
        error: error.message,
      })
    }
  }

  clearSession() {
    try {
      localStorage.removeItem(UserService.TOKEN_KEY)
      localStorage.removeItem(UserService.USER_KEY)
      localStorage.removeItem(UserService.SESSION_KEY)

      api.log.info("会话信息清除成功")
    } catch (error) {
      api.log.error("清除会话信息失败", {
        error: error.message,
      })
    }
  }

  getStoredUser() {
    try {
      const userJson = localStorage.getItem(UserService.USER_KEY)
      if (!userJson) {
        return null
      }

      const userData = JSON.parse(userJson)
      const token = localStorage.getItem(UserService.TOKEN_KEY)

      if (!token || token !== userData.token) {
        api.log.warn("存储的token不匹配，清除会话")
        this.clearSession()
        return null
      }

      api.log.info("从本地存储恢复用户信息成功", {
        userId: userData.userId,
      })

      return userData
    } catch (error) {
      api.log.error("获取存储的用户信息失败", {
        error: error.message,
      })
      this.clearSession()
      return null
    }
  }

  isValidSession() {
    try {
      const sessionJson = localStorage.getItem(UserService.SESSION_KEY)
      if (!sessionJson) {
        return false
      }

      const session = JSON.parse(sessionJson)
      const token = localStorage.getItem(UserService.TOKEN_KEY)

      // 检查会话是否过期（24小时）
      const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000

      if (isExpired || !token || token !== session.token) {
        api.log.warn("会话已过期或无效", {
          isExpired,
          hasToken: !!token,
        })
        this.clearSession()
        return false
      }

      return true
    } catch (error) {
      api.log.error("验证会话有效性失败", {
        error: error.message,
      })
      this.clearSession()
      return false
    }
  }
}

const userService = new UserService()
context.wpm.export("service_user", userService)
