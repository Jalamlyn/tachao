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
  getMetadata,
  getPublicMetaData,
  queryMetadataHistory,
  setMetadata,
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

let esmIns = null

// 创建一个包装了超时控制的 wpm 对象
const wpm = {
  export: wpmOriginal.export,
  import: async (moduleName: string) => {
    // 创建一个超时 Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error(
          `模块 ${moduleName} 未实现或其依赖模块未实现，请检查：\n1. 该模块是否已通过 wpm.export 导出\n2. 该模块内部引用的其他模块是否都已实现`
        )
        logStore.error(`模块导入失败: ${moduleName}`, { error: error.message })
        reject(error)
      }, 2000)
    })

    try {
      // 使用 Promise.race 竞争
      const result = await Promise.race([wpmOriginal.import(moduleName), timeoutPromise])

      // 检查结果是否有效
      if (!result) {
        const error = new Error(
          `模块 ${moduleName} 未实现或返回值为空，请确保：\n1. 模块已正确导出\n2. 导出的内容不为空`
        )
        logStore.error(`模块导入失败: ${moduleName}`, { error: error.message })
        throw error
      }

      logStore.info(`模块导入成功: ${moduleName}`)
      return result
    } catch (error) {
      logStore.error(`模块导入错误: ${moduleName}`, { error: error.message })
      throw new Error(`导入模块 ${moduleName} 失败: ${error.message}`)
    }
  },
}

// 检查是否是微信环境
const isWeixinBrowser = () => {
  return /MicroMessenger/i.test(navigator.userAgent)
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
    // 检查是否是微信环境
    if (isWeixinBrowser()) {
      throw new Error("微信环境暂不支持上传功能，请使用其他浏览器")
    }

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
          details,
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
          details,
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
          details,
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
          details,
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

export const context = (appId) => ({
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
  ai,
  mobx,
  recharts,
  cn,
  xlsx: XLSX,
  esm: async () => {
    if (esmIns) {
      return esmIns.default
    } else {
      esmIns = await import("https://esm.sh/build")
      return esmIns.default
    }
  },
})
