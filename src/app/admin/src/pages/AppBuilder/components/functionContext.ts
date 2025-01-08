import wpm from "@wpm-js/core"
import * as ReactRouterDom from "react-router-dom"
import * as FramerMotion from "framer-motion"
import { ai } from "@/service/ai"
import * as NextUI from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import * as mobx from "mobx"
import { Icon } from "@iconify/react"
import { getMetadata, getPublicMetaData, queryMetadataHistory, setMetadata } from "@/service/apis/metadata"
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

let esmIns = null

// 检查是否是微信环境
const isWeixinBrowser = () => {
  return /MicroMessenger/i.test(navigator.userAgent)
}

// 上传文件相关API
export const uploadAPI = {
  // 获取签名URL
  getSignedUrl: async (fileName: string) => {
    try {
      const res = await apiService.get(`/api/file/form/upload:singed?fileName=${fileName}`)
      return res.data
    } catch (error) {
      message.error("获取签名URL失败，请重试！")
      throw error
    }
  },

  // 创建活动数据
  createActivity: async (fileInfo: { fileName: string; fileKey: string }) => {
    try {
      const response = await apiService.post("/public/data/file/activitiess", {
        activityName: "测试",
        activityType: "test",
        files: [fileInfo],
      })
      return response.data
    } catch (error) {
      console.error("Create activity error:", error)
      throw error
    }
  },

  // 查询活动数据
  queryActivity: async () => {
    try {
      const response = await apiService.post(
        "/public/data/file/activitiess/find",
        {},
        {
          params: { display: "paginate" },
        }
      )
      return response.data
    } catch (error) {
      console.error("Query activity error:", error)
      throw error
    }
  },

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
      const signedData = await uploadAPI.getSignedUrl(file.name)
      const formData = new FormData()
      formData.append("key", signedData.fileKey)
      formData.append("OSSAccessKeyId", signedData.accessKeyId)
      formData.append("policy", signedData.policy)
      formData.append("Signature", signedData.signature)
      formData.append("file", file)

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && options?.onProgress) {
            const percent = Math.round((event.loaded * 100) / event.total)
            options.onProgress(percent)
          }
        }

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // 创建活动数据
              await uploadAPI.createActivity({
                fileName: file.name,
                fileKey: signedData.fileKey,
              })

              // 查询获取完整信息
              const queryResult = await uploadAPI.queryActivity()

              if (!queryResult?.data || !Array.isArray(queryResult.data) || queryResult.data.length === 0) {
                throw new Error("未找到上传的文件信息")
              }

              // 获取最新的活动记录（按创建时间排序，取最新的）
              const latestActivity = queryResult.data.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0]

              const fileInfo = latestActivity.files[0]

              options?.onSuccess?.(fileInfo)
              resolve(fileInfo)
            } catch (error) {
              console.error("Process file error:", error)
              const err = error as Error
              options?.onError?.(err)
              reject(err)
            }
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`)
            options?.onError?.(error)
            reject(error)
          }
        }

        xhr.onerror = () => {
          const error = new Error("Upload failed")
          options?.onError?.(error)
          reject(error)
        }

        xhr.open("POST", signedData.formUploadHost.replace("http:", ""), true)
        xhr.send(formData)
      })
    } catch (error) {
      console.error("Upload error:", error)
      options?.onError?.(error as Error)
      throw error
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
    queryMetadataHistory,
    getCurrentAccountInfo,
    queryCurrentEnterPrise,
    // 位置服务API
    location: {
      getCurrentPosition,
      getAddressFromLocation,
      getLocationPermissionGuide,
    },
    // 文件上传API
    upload: uploadAPI,
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
