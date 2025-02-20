import axios from "axios"
import { message } from "@/lib/Message"
import { blog, getAppId } from "@/lib/util-index"

export const modelBaseUserToken = "model-base-user-token"

export const apiService = axios.create({
  // @ts-ignore
  baseURL: !window.location.href.includes("mobenai.com.cn")
    ? "https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/api"
    : __API_BASE_URL__,
  headers: {
    "Content-Type": "application/json",
  },
})

export const wxAPIService = axios.create({
  // @ts-ignore
  baseURL: "/external/api",
  headers: {
    "Content-Type": "application/json",
  },
})

apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(modelBaseUserToken)
    if (token) {
      config.headers["token"] = `${token}`
    }
    const appId = getAppId()
    if (appId !== "null" && appId && !config.headers["x-app"] && appId !== "undefined") {
      config.headers["x-app"] = appId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiService.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      if (response.data.code === 401) {
        const currentUrl = window.location.href
        // 排除登录页面本身，避免循环
        const isHomePage = window.location.pathname === "/"
        if (!currentUrl.includes("/login") && !isHomePage) {
          localStorage.removeItem(modelBaseUserToken)
          // 将当前 URL 编码后作为 callback 参数
          const encodedCallback = encodeURIComponent(currentUrl)
          window.location.href = `/login?callback=${encodedCallback}`
        }
      }
      return response
    } else {
      return Promise.reject(new Error(`网络请求错误 ${response.status}`))
    }
  },
  (error) => {
    console.log(error)
    if (error.response) {
      if (error.response.status === 401) {
        // 保存当前的完整 URL
        const currentUrl = window.location.href
        // 排除登录页面本身，避免循环
        const isHomePage = window.location.pathname === "/"
        if (!currentUrl.includes("/login") && !isHomePage) {
          localStorage.removeItem(modelBaseUserToken)
          // 将当前 URL 编码后作为 callback 参数
          const encodedCallback = encodeURIComponent(currentUrl)
          window.location.href = `/login?callback=${encodedCallback}`
        }
      } else if (error.response.data.code === 400) {
        if (error.response.data.data) {
          message.error(error.response.data.data.message)
        }
        if (error.response.data.message) {
          message.error(error.response.data.message)
        }
      }
    }
    return Promise.reject(error)
  }
)

// 等待列表接口类型定义
export interface WaitListRequest {
  email: string
  phone: string
  developer: boolean
  industry: string
  purpose: string
}

export interface WaitListQueryParams {
  email?: string
  phone?: string
  developer?: boolean
  industry?: string
  purpose?: string
}

// 等待列表 API
export const submitWaitList = async (data: WaitListRequest) => {
  try {
    const response = await apiService.post("/public/api/wait-lists", data)
    return response.data
  } catch (error) {
    throw error
  }
}

// 查询等待列表 API
export const queryWaitList = async (params: WaitListQueryParams) => {
  try {
    const response = await apiService.get("/plat/api/wait-lists", { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export * from "./auth"
export * from "./enterprise"
export * from "./metadata"
