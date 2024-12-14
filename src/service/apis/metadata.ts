import { apiService } from "./api"
import { getAppId } from "@/utils"

export const queryMetadataHistory = async (data: {
  jsonValueFilter?: {
    field: string
    operator: string
    value: { [key: string]: any }
  }
  names: string[]
  limit?: number
  offset?: number
  tags?: string[]
  title?: string
}) => {
  const historyUrl = `/internal/apps/${getAppId()}/metadata/AI_AGENT/histories`
  let config = {
    headers: {},
  }
  const res = await apiService.post(historyUrl, data, config)
  return res.data
}

export const getPublicMetaData = async (names) => {
  const getPublicUrl = `/public/api/metadata/app/type/AI_AGENT`
  const res = await apiService.post(getPublicUrl, {
    names,
  })
  return res.data
}

export const getMetadata = async (names) => {
  const getUrl = `/internal/apps/${getAppId()}/metadata/AI_AGENT/list`
  const res = await apiService.post(getUrl, {
    names,
  })
  return res.data
}

export const setMetadata = async (name, value) => {
  const url = `/internal/apps/${getAppId()}/metadata`
  const stringValue = typeof value === "string" ? value : JSON.stringify(value)
  const res = await apiService.post(url, {
    type: "AI_AGENT",
    name,
    value: stringValue,
    title: "",
    tags: [],
  })
  //最多保存最近 20次提交的版本
  deleteMetadata({ name, versionCode: Number(res.data.versionCode) - 20 })
  return res.data
}

export const deleteMetadata = async ({ name, versionCode }) => {
  const deleteUrl = `/internal/apps/${getAppId()}/metadata`
  const res = await apiService.delete(deleteUrl, {
    data: {
      type: "AI_AGENT",
      name,
      versionCode,
    },
  })
  return res.data
}

export const deletePlatMetaData = async (name, versionCode = false) => {
  const data = {
    type: "PLUGIN",
    name,
  }
  if (versionCode) {
    data.versionCode = versionCode
  }
  const res = await apiService.delete(`/global/metadata`, {
    data,
  })
  return res.data
}
export const setPlatMetaData = async ({ name, value }) => {
  const res = await apiService.post(`/global/metadata`, {
    name,
    value,
    type: "PLUGIN",
    feInterpreterVersion: "v0",
    feDeviceType: "Browser",
  })
  return res.data
}
export const getPlatMetaData = async (names = [], limit = 1) => {
  const res = await apiService.post(`/global/metadata/PLUGIN/queryByNames`, {
    limit,
    offset: 0,
  })
  return res.data
}