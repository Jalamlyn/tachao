import { apiService } from "./api"
import { getAppId } from "@/utils"

// 元数据键名常量
export const PHONE_ORG_MAPPING_KEY = "phone_org_mapping"
export const ACCOUNT_REQUESTS_KEY = "account_requests"

// 缓存和请求管理
const metadataCache = new Map()
const pendingMetadataRequests = new Map()
const pendingSetRequests = new Map()
const CACHE_DURATION = 0 // 5秒缓存
const DEBOUNCE_DELAY = 300 // 300ms 防抖延迟

// 实际执行 setMetadata 的函数
const executeSetMetadata = async (name, value, appId) => {
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

  deleteMetadata({ name, versionCode: Number(res.data.versionCode) - 20 })
  return res.data
}

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
  const appId = getAppId()
  const getPublicUrl = `/public/api/metadata/app/type/AI_AGENT`
  const res = await apiService.post(
    getPublicUrl,
    {
      names,
    },
    {
      headers: {
        appId,
      },
    }
  )
  return res.data
}

export const getMetadata = async (names, appId) => {
  const cacheKey = JSON.stringify({ names, appId })

  // 1. 检查缓存
  const cached = metadataCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // 2. 检查是否有相同请求正在进行
  if (pendingMetadataRequests.has(cacheKey)) {
    return pendingMetadataRequests.get(cacheKey)
  }

  // 3. 立即发起新请求
  const getUrl = `/internal/apps/${getAppId()}/metadata/AI_AGENT/list`
  const promise = apiService.post(getUrl, { names }, { headers: { "x-app": appId } }).then((res) => {
    const data = res.data
    // 存入缓存
    metadataCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })
    pendingMetadataRequests.delete(cacheKey)
    return data
  })

  pendingMetadataRequests.set(cacheKey, promise)
  return promise
}

export const setMetadata = async (name, value, appId) => {
  // 如果已有相同name的pending请求，说明这是短时间内的重复调用
  if (pendingSetRequests.has(name)) {
    clearTimeout(pendingSetRequests.get(name).timeoutId)

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await executeSetMetadata(name, value, appId)
          pendingSetRequests.delete(name)
          resolve(result)
        } catch (error) {
          pendingSetRequests.delete(name)
          reject(error)
        }
      }, DEBOUNCE_DELAY)

      pendingSetRequests.set(name, { timeoutId, promise: { resolve, reject } })
    })
  }

  // 第一次调用，立即执行
  try {
    const result = await executeSetMetadata(name, value, appId)
    return result
  } catch (error) {
    throw error
  }
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
  const result = await getMetadata([PHONE_ORG_MAPPING_KEY], "1869963081721307138")
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
