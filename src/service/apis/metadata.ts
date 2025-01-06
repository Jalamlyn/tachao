import { apiService } from "./api"
import { getAppId } from "@/utils"

// 元数据键名常量
export const PHONE_ORG_MAPPING_KEY = "phone_org_mapping"
export const ACCOUNT_REQUESTS_KEY = "account_requests"

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

export const getPublicMetaData = async (names, appId) => {
  const getPublicUrl = `/public/api/metadata/app/type/AI_AGENT`
  const res = await apiService.post(
    getPublicUrl,
    {
      names,
    },
    {
      headers: {
        "x-app": appId,
      },
    }
  )
  return res.data
}

export const getMetadata = async (names, appId) => {
  const getUrl = `/internal/apps/${getAppId()}/metadata/AI_AGENT/list`
  const res = await apiService.post(
    getUrl,
    {
      names,
    },
    {
      headers: {
        "x-app": appId,
      },
    }
  )
  return res.data
}

export const setMetadata = async (name, value, appId) => {
  const url = `/internal/apps/${getAppId()}/metadata`
  const stringValue = typeof value === "string" ? value : JSON.stringify(value)
  const res = await apiService.post(
    url,
    {
      type: "AI_AGENT",
      name,
      value: stringValue,
      title: "",
      tags: [],
    },
    {
      headers: {
        "x-app": appId,
      },
    }
  )
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
    names,
    limit,
    offset: 0,
  })
  return res.data
}

// 手机号-组织映射相关方法
export const getPhoneOrgMapping = async (phone: string) => {
  const result = await getPublicMetaData([PHONE_ORG_MAPPING_KEY], "1869963081721307138	")
  const mapping = JSON.parse(result.data?.[0]?.value || "{}")
  return mapping[phone]
}

export const setPhoneOrgMapping = async (phone: string, orgId: string) => {
  const result = await getMetadata([PHONE_ORG_MAPPING_KEY], "1869963081721307138")
  const mapping = JSON.parse(result.data?.[0]?.value || "{}")
  mapping[phone] = orgId
  await setMetadata(PHONE_ORG_MAPPING_KEY, mapping, "1869963081721307138")
}

// 账号申请相关方法
export const getAccountRequests = async () => {
  const result = await getMetadata([ACCOUNT_REQUESTS_KEY])
  return JSON.parse(result.data?.[0]?.value || "{}")
}

export const addAccountRequest = async (request: {
  id: string
  phone: string
  organizationId: string
  organizationName: string
  status: "pending" | "completed" | "rejected"
  createdAt: string
  updatedAt: string
}) => {
  const requests = await getAccountRequests()
  requests[request.id] = request
  await setMetadata(ACCOUNT_REQUESTS_KEY, requests)
}

export const updateAccountRequest = async (
  requestId: string,
  updates: Partial<{
    status: "pending" | "completed" | "rejected"
    updatedAt: string
  }>
) => {
  const requests = await getAccountRequests()
  if (requests[requestId]) {
    requests[requestId] = {
      ...requests[requestId],
      ...updates,
    }
    await setMetadata(ACCOUNT_REQUESTS_KEY, requests)
  }
}
