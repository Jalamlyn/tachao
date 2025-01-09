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
import { logStore } from "../AIEditor/components/LogStore"

let esmIns = null

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

// 上传文件相关API
export const uploadAPI = {
  // ... 保持原有代码不变
}

// 日志工具
export const logAPI = {
  info: (message: string, details?: any) => {
    logStore.info(message, details)
  },
  warn: (message: string, details?: any) => {
    logStore.warn(message, details)
  },
  error: (message: string, details?: any) => {
    logStore.error(message, details)
  },
  debug: (message: string, details?: any) => {
    logStore.debug(message, details)
  },
  clear: () => {
    logStore.clear()
  }
}

// 替换console.log
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug
}

// 重写console方法
console.log = (...args: any[]) => {
  originalConsole.log(...args)
  logStore.info(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' '))
}

console.warn = (...args: any[]) => {
  originalConsole.warn(...args)
  logStore.warn(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' '))
}

console.error = (...args: any[]) => {
  originalConsole.error(...args)
  logStore.error(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' '))
}

console.debug = (...args: any[]) => {
  originalConsole.debug(...args)
  logStore.debug(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' '))
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
    location: {
      getCurrentPosition,
      getAddressFromLocation,
      getLocationPermissionGuide,
    },
    upload: uploadAPI,
    // 添加日志API
    log: logAPI
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