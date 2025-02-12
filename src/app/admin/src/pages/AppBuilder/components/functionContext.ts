import wpmOriginal from "@wpm-js/core"
import * as ReactRouterDom from "react-router-dom"
import * as FramerMotion from "framer-motion"
import { ai } from "@/service/ai"
import * as NextUI from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import * as mobx from "mobx"
import { Icon } from "@iconify/react"
import {
  deleteMetadata,
  getMetadata as originalGetMetadata,
  getPublicMetaData as originalGetPublicMetaData,
  queryMetadataHistory,
  setMetadata as originalSetMetadata,
} from "@/service/apis/metadata"
import * as recharts from "recharts"
import { cn } from "@/theme/cn"
import React from "react"
import message from "@/components/Message"
import * as ReactToPrint from "react-to-print"
import * as XLSX from "xlsx"
import {
  getCurrentPosition,
  getAddressFromLocation,
} from "@/components/common/DynamicForm/components/FormFields/renders/ClockIn/utils/locationUtils"
import { getLocationPermissionGuide } from "@/components/common/DynamicForm/components/FormFields/renders/ClockIn/utils/browserUtils"
import { apiService, getCurrentAccountInfo, queryCurrentEnterPrise } from "@/service/apis/api"
import * as ReactHookForm from "react-hook-form"
import { logStore } from "../AIEditor/components/LogStore"
import { requestStore } from "../AIEditor/components/RequestStore"
import { LuckyWheel, LuckyGrid, SlotMachine } from "@lucky-canvas/react"

// 检查是否在iframe中运行
const isInIframe = () => {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

// 包装getMetadata函数
const getMetadata = async (names: string[], appId?: string) => {
  try {
    const response = await originalGetMetadata(names, appId)

    if (isInIframe()) {
      // 在iframe中,发送请求数据到父窗口
      window.parent.postMessage(
        {
          type: "REQUEST",
          method: "GET",
          params: { names, appId },
          response,
        },
        "*"
      )
    } else {
      // 在主窗口中直接添加到store
      requestStore.addRequest({
        method: "GET",
        params: { names, appId },
        response,
      })
    }

    return response
  } catch (error) {
    if (isInIframe()) {
      window.parent.postMessage(
        {
          type: "REQUEST",
          method: "GET",
          params: { names, appId },
          response: error,
        },
        "*"
      )
    } else {
      requestStore.addRequest({
        method: "GET",
        params: { names, appId },
        response: error,
      })
    }
    throw error
  }
}

// 包装setMetadata函数
const setMetadata = async (name: string, value: any, appId?: string) => {
  try {
    const response = await originalSetMetadata(name, value, appId)

    if (isInIframe()) {
      window.parent.postMessage(
        {
          type: "REQUEST",
          method: "SET",
          params: { name },
          response,
        },
        "*"
      )
    } else {
      requestStore.addRequest({
        method: "SET",
        params: { name, value, appId },
        response,
      })
    }

    return response
  } catch (error) {
    if (isInIframe()) {
      window.parent.postMessage(
        {
          type: "REQUEST",
          method: "SET",
          params: { name, value, appId },
          response: error,
        },
        "*"
      )
    } else {
      requestStore.addRequest({
        method: "SET",
        params: { name, value, appId },
        response: error,
      })
    }
    throw error
  }
}

// 包装getPublicMetaData函数
const getPublicMetaData = async (names: string[]) => {
  try {
    const response = await originalGetPublicMetaData(names)

    if (isInIframe()) {
      window.parent.postMessage(
        {
          type: "REQUEST",
          method: "GET",
          params: { names, type: "public" },
          response,
        },
        "*"
      )
    } else {
      requestStore.addRequest({
        method: "GET",
        params: { names, type: "public" },
        response,
      })
    }

    return response
  } catch (error) {
    if (isInIframe()) {
      window.parent.postMessage(
        {
          type: "REQUEST",
          method: "GET",
          params: { names, type: "public" },
          response: error,
        },
        "*"
      )
    } else {
      requestStore.addRequest({
        method: "GET",
        params: { names, type: "public" },
        response: error,
      })
    }
    throw error
  }
}

// 异步加载esm
let esmModule: any = null
const loadEsm = async () => {
  try {
    if (!esmModule) {
      logStore.info("开始加载ESM模块")
      const module = await import("https://esm.sh/build")
      esmModule = module.esm
      logStore.info("ESM模块加载完成")
    }
    return esmModule
  } catch (error) {
    logStore.error("ESM模块加载失败", { error: error.message })
    throw new Error(`加载ESM模块失败: ${error.message}`)
  }
}

// 创建一个包装了超时控制的 wpm 对象
let hasModuleTimeoutError = false

const wpm = {
  export: wpmOriginal.export,
  import: async (moduleName: string) => {
    // 如果已经有模块超时了,直接返回 null 或者抛出普通错误
    if (hasModuleTimeoutError) {
      return null // 或者静默失败
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        // 第一次超时时设置标记
        if (!hasModuleTimeoutError) {
          hasModuleTimeoutError = true
          const error = new Error(`模块 ${moduleName} 导入超时(3秒)`)
          error.name = "ModuleNotImplementedError"
          reject(error)
        } else {
          // 后续超时静默失败
          reject(new Error(`Module ${moduleName} timeout`))
        }
      }, 3000)
    })

    try {
      const result = await Promise.race([wpmOriginal.import(moduleName), timeoutPromise])

      if (!result) {
        if (!hasModuleTimeoutError) {
          hasModuleTimeoutError = true
          const error = new Error(`模块 ${moduleName} 未实现或返回值为空`)
          error.name = "ModuleNotImplementedError"
          throw error
        }
        return null
      }

      return result
    } catch (error) {
      // 如果已经有超时错误了,不再抛出新的错误
      if (hasModuleTimeoutError) {
        return null
      }

      if (error.name === "ModuleNotImplementedError") {
        hasModuleTimeoutError = true
      }
      throw error
    }
  },
}

// 添加重置方法
export const resetModuleTimeoutState = () => {
  hasModuleTimeoutError = false
}

// 生成唯一的文件路径
const generateCloudPath = (file: File) => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = file.name.split(".").pop()
  return `uploads/${timestamp}-${randomStr}.${ext}`
}

export const uploadAPI = {
  // 上传文件
  uploadFile: async (
    file: File,
    options?: {
      onProgress?: (percent: number) => void
      maxSize?: number
      customRequest?: (params: { file: File; onProgress: (percent: number) => void }) => Promise<any>
      onSuccess?: (fileInfo: any) => void
      onError?: (error: Error) => void
      uploadType?: string
      cropOptions?: {
        quality?: number
      }
    }
  ) => {
    // 检查文件大小
    if (options?.maxSize && file.size > options.maxSize) {
      throw new Error(`文件大小不能超过 ${options.maxSize / 1024 / 1024}MB`)
    }

    // 如果是图片且需要处理
    if (options?.uploadType === "image" && options.cropOptions) {
      const { quality = 0.8 } = options.cropOptions
      // 这里可以添加图片处理逻辑
    }

    // 使用自定义上传
    if (options?.customRequest) {
      try {
        const result = await options.customRequest({
          file,
          onProgress: options.onProgress || (() => {}),
        })
        options?.onSuccess?.(result)
        return result
      } catch (error) {
        console.error("Custom upload error:", error)
        options?.onError?.(error as Error)
        throw error
      }
    }

    // 默认上传逻辑
    try {
      // 第一步：匿名认证
      const auth = app.auth()
      await auth.signInAnonymously()

      // 第二步：上传文件
      const cloudPath = generateCloudPath(file)
      const uploadResult = await app.uploadFile({
        cloudPath,
        filePath: file,
      })

      // 第三步：获取临时URL
      const urlResult = await app.getTempFileURL({
        fileList: [uploadResult.fileID],
      })

      const tempFileURL = urlResult.fileList[0]?.tempFileURL
      if (!tempFileURL) {
        throw new Error("获取文件访问地址失败")
      }

      const fileInfo = {
        fileName: file.name,
        fileUrl: tempFileURL,
        fileID: uploadResult.fileID,
      }

      options?.onSuccess?.(fileInfo)
      return fileInfo
    } catch (error) {
      console.error("Upload error:", error)
      options?.onError?.(error as Error)
      throw error
    }
  },
}

// 日志工具
export const logAPI = {
  info: (message: string, details?: any) => {
    if (window.parent && window.parent !== window) {
      // 在 iframe 中运行时，发送日志到父窗口
      window.parent.postMessage(
        {
          type: "LOG",
          level: "info",
          message,
          details: JSON.stringify(details, null, 2),
        },
        "*"
      )
    } else {
      // 在父窗口中直接使用 logStore
      logStore.info(message, details)
    }
  },
  warn: (message: string, details?: any) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "LOG",
          level: "warn",
          message,
          details: JSON.stringify(details, null, 2),
        },
        "*"
      )
    } else {
      logStore.warn(message, details)
    }
  },
  error: (message: string, details?: any) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "LOG",
          level: "error",
          message,
          details: JSON.stringify(details, null, 2),
        },
        "*"
      )
    } else {
      logStore.error(message, details)
    }
  },
  debug: (message: string, details?: any) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "LOG",
          level: "debug",
          message,
          details: JSON.stringify(details, null, 2),
        },
        "*"
      )
    } else {
      logStore.debug(message, details)
    }
  },
  clear: () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "LOG_CLEAR",
        },
        "*"
      )
    } else {
      logStore.clear()
    }
  },
}

export const context = (appId, mode) => ({
  wpm: mode === "runtime" ? wpmOriginal : wpm,
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
  api: {
    getMetadata,
    setMetadata,
    getPublicMetaData,
    deleteMetadata,
    queryMetadataHistory,
    getCurrentAccountInfo,
    queryCurrentEnterPrise,
    location: {
      getCurrentPosition,
      getAddressFromLocation,
      getLocationPermissionGuide,
    },
    upload: uploadAPI,
    log: logAPI,
  },
  npm: {
    "@lucky-canvas/react": {
      LuckyWheel,
      LuckyGrid,
      SlotMachine,
    },
  },
  ai,
  mobx,
  recharts,
  cn,
  xlsx: XLSX,
  esm: loadEsm, // 导出异步加载函数而不是直接导出esm模块
})
