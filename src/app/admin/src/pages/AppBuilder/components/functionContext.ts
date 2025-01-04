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
import * as XLSX from 'xlsx'
import { getCurrentPosition, getAddressFromLocation } from "@/components/common/DynamicForm/components/FormFields/renders/ClockIn/utils/locationUtils"
import { getLocationPermissionGuide } from "@/components/common/DynamicForm/components/FormFields/renders/ClockIn/utils/browserUtils"

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
    // 添加位置服务API
    location: {
      getCurrentPosition,
      getAddressFromLocation,
      getBrowserPermissionGuide
    }
  },
  ai,
  mobx,
  recharts,
  cn,
  docker,
  xlsx: XLSX,
})