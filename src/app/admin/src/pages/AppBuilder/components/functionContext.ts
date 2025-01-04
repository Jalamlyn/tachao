import wpm from "@wpm-js/core"
import * as ReactRouterDom from "react-router-dom"
import * as FramerMotion from "framer-motion"
import { ai } from "@/service/ai"
import * as NextUI from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import * as mobx from "mobx"
import { Icon } from "@iconify/react"
import { getMetadata, getPublicMetaData, setMetadata } from "@/service/apis/metadata"
import * as recharts from "recharts"
import { cn } from "@/theme/cn"
import React from "react"
import message from "@/components/Message"
import * as XLSX from "xlsx"
import {
  getCurrentPosition,
  getAddressFromLocation,
} from "@/components/common/DynamicForm/components/FormFields/renders/ClockIn/utils/locationUtils"
import { getLocationPermissionGuide } from "@/components/common/DynamicForm/components/FormFields/renders/ClockIn/utils/browserUtils"
import { apiService } from "@/service/apis/api"

// 上传文件相关API
const uploadAPI = {
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
    }
  ) => {
    // 检查文件大小
    if (options?.maxSize && file.size > options.maxSize) {
      throw new Error(`文件大小不能超过 ${options.maxSize / 1024 / 1024}MB`)
    }

    // 使用自定义上传
    if (options?.customRequest) {
      return await options.customRequest({
        file,
        onProgress: options.onProgress || (() => {}),
      })
    }

    // 默认上传逻辑
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

            const latestActivity = queryResult.data.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0]

            if (!latestActivity.files || !Array.isArray(latestActivity.files) || latestActivity.files.length === 0) {
              throw new Error("文件信息不完整")
            }

            const fileInfo = latestActivity.files[0]
            if (!fileInfo || !fileInfo.downloadUrl) {
              throw new Error("文件下载链接不可用")
            }

            resolve(fileInfo)
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error("Upload failed"))
      }

      xhr.open("POST", signedData.formUploadHost.replace("http:", ""), true)
      xhr.send(formData)
    })
  },
}

const docker = {
  AppEntry: () => {},
}

export const context = (appId) => ({
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  appId,
  api: {
    getMetadata,
    setMetadata,
    getPublicMetaData,
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
  docker,
  xlsx: XLSX,
})
