import axios from "axios"
import { message } from "@/components/Message"
import { blog, getAppId } from "@/utils"
import { localDB } from "@/utils/localDB"

export const modelBaseUserToken = "model-base-user-token"

export const apiService = axios.create({
  // @ts-ignore
  baseURL: !window.location.href.includes("mobenai.com.cn")
    ? "https://1259692580-dzwlwuk5dc.ap-shanghai.tencentscf.com/api"
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
    if (appId !== "null" && appId && !config.headers["x-app"]) {
      config.headers["x-app"] = appId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    if (error.response) {
      if (error.response.status === 401) {
        // 保存当前的完整 URL 和请求配置
        const currentUrl = window.location.href
        localDB.setItem('global:pendingRequest', error.config)
        
        // 显示登录Modal
        localDB.setItem('global:showLoginModal', true)
        
        // 等待登录成功
        return new Promise((resolve) => {
          const unwatch = localDB.watchKey('global:loginSuccess', async () => {
            const config = localDB.getItem('global:pendingRequest')
            if (config) {
              try {
                const result = await axios(config)
                resolve(result)
              } catch (retryError) {
                console.error('Retry request failed:', retryError)
                message.error('请求重试失败,请刷新页面重试')
              }
            }
            unwatch()
            localDB.removeItem('global:loginSuccess')
          })
        })
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
export * from "./user"
export * from "./project"
export * from "./app"
export * from "./role"
export * from "./tenant"
export * from "./data"
export * from "./model"
export * from "./metadata"
export * from "./wx"