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

const { makeAutoObservable, runInAction } = mobx

const userService = await wpm.import("service_user")

class UserStore {
  userInfo = null
  loading = false
  error = null
  initialized = false
  redirectPath = "/"

  // 位置相关状态
  location = null
  locationLoading = false
  locationError = null
  locationPermissionDenied = false

  constructor() {
    makeAutoObservable(this)
    this.initialize()
  }

  async initialize() {
    if (this.initialized) {
      return
    }

    try {
      api.log.info("开始初始化用户状态")

      // 检查会话有效性
      if (!userService.isValidSession()) {
        api.log.info("没有有效的会话")
        return
      }

      // 恢复用户信息
      const storedUser = userService.getStoredUser()
      if (storedUser) {
        runInAction(() => {
          this.userInfo = storedUser
          api.log.info("用户状态恢复成功", {
            userId: storedUser.userId,
          })
        })
      }
    } catch (error) {
      api.log.error("初始化用户状态失败", {
        error: error.message,
      })
    } finally {
      runInAction(() => {
        this.initialized = true
      })
    }
  }

  setRedirectPath(path) {
    this.redirectPath = path
    api.log.info("设置登录后重定向路径", { path })
  }

  clearRedirectPath() {
    this.redirectPath = "/"
  }

  login = async (phone, password) => {
    try {
      api.log.info("开始用户登录", { phone })

      runInAction(() => {
        this.loading = true
        this.error = null
      })

      const result = await userService.login(phone, password)

      runInAction(() => {
        this.userInfo = result.user
        this.error = null
      })

      message.success("登录成功")

      api.log.info("用户登录成功", {
        userId: result.userId,
        phone,
      })
    } catch (error) {
      api.log.error("用户登录失败", {
        phone,
        error: error.message,
      })

      runInAction(() => {
        this.error = error.message
        this.userInfo = null
      })

      throw error
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  register = async (phone, password) => {
    try {
      api.log.info("开始用户注册", { phone })

      runInAction(() => {
        this.loading = true
        this.error = null
      })

      const result = await userService.register(phone, password)

      runInAction(() => {
        this.userInfo = result.user
        this.error = null
      })

      message.success("注册成功")

      api.log.info("用户注册成功", {
        userId: result.userId,
        phone,
      })
    } catch (error) {
      api.log.error("用户注册失败", {
        phone,
        error: error.message,
      })

      runInAction(() => {
        this.error = error.message
        this.userInfo = null
      })

      message.error(error.message)
      throw error
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  logout = async () => {
    try {
      api.log.info("开始用户登出")

      runInAction(() => {
        this.loading = true
      })

      await userService.logout()

      runInAction(() => {
        this.userInfo = null
        this.error = null
        this.location = null
        this.locationError = null
        this.locationPermissionDenied = false
        this.redirectPath = "/"
      })

      message.success("已退出登录")

      api.log.info("用户登出成功")
    } catch (error) {
      api.log.error("用户登出失败", {
        error: error.message,
      })
      message.error(error.message)
      throw error
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      api.log.warn("浏览器不支持地理定位")
      message.error("您的浏览器不支持地理定位")
      return
    }

    try {
      api.log.info("请求位置权限")

      runInAction(() => {
        this.locationLoading = true
        this.locationError = null
        this.locationPermissionDenied = false
      })

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        })
      })

      runInAction(() => {
        this.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
      })

      api.log.info("获取位置成功", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })

      return this.location
    } catch (error) {
      api.log.error("获取位置失败", {
        error: error.message,
        code: error.code,
      })

      runInAction(() => {
        this.locationError = error.message
        this.locationPermissionDenied = error.code === 1
      })

      if (error.code === 1) {
        message.error("需要位置权限才能显示附近活动")
      } else if (error.code === 2) {
        message.error("获取位置失败，请检查GPS是否开启")
      } else if (error.code === 3) {
        message.error("获取位置超时，请重试")
      } else {
        message.error("获取位置失败: " + error.message)
      }

      throw error
    } finally {
      runInAction(() => {
        this.locationLoading = false
      })
    }
  }

  get isLoggedIn() {
    return !!this.userInfo
  }
}

const userStore = new UserStore()
context.wpm.export("store_user", userStore)
