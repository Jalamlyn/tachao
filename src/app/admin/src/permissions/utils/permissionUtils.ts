import { getMetadata, setMetadata, setPlatMetaData, getPlatMetaData } from "@/service/apis/metadata"
import {
  Permission,
  PermissionMetadata,
  ResourceType,
  TemplatePermissionRole,
  Subscription,
  AccountUsage,
  SubscriptionHistory,
} from "../types"
import { hasRequiredPermission } from "../config/constants"

const PERMISSION_REQUESTS_KEY = "permission_requests"

// 元数据键值定义
const METADATA_KEYS = {
  // 原有权限相关键值
  PERMISSIONS: (resourceType: ResourceType) => `permissions_${resourceType}`,
  // 新增订阅相关键值
  SUBSCRIPTION: (orgId: string) => `org_subscription_${orgId}`,
  ACCOUNT_USAGE: (orgId: string) => `org_account_usage_${orgId}`,
  SUBSCRIPTION_HISTORY: (orgId: string) => `org_subscription_history_${orgId}`,
}

export const getPermissionMetadataKey = (resourceType: ResourceType) => `permissions_${resourceType}`

export const getResourcePermissions = async (resourceType: ResourceType): Promise<PermissionMetadata> => {
  const key = getPermissionMetadataKey(resourceType)
  try {
    const result = await getMetadata([key])
    const data = result.data?.[0]?.value
    const permissions = data ? JSON.parse(data) : {}

    // 确保每个资源都有默认的权限设置
    Object.keys(permissions).forEach((resourceId) => {
      if (!permissions[resourceId].hasOwnProperty("isPublic")) {
        permissions[resourceId].isPublic = true // 设置默认为公开访问
      }
    })

    return permissions
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return {}
  }
}

export const setResourcePermissions = async (
  resourceType: ResourceType,
  permissions: PermissionMetadata
): Promise<void> => {
  const key = getPermissionMetadataKey(resourceType)
  try {
    // 确保新添加的资源默认为公开访问
    Object.keys(permissions).forEach((resourceId) => {
      if (!permissions[resourceId].hasOwnProperty("isPublic")) {
        permissions[resourceId].isPublic = true
      }
    })
    await setMetadata(key, JSON.stringify(permissions))
  } catch (error) {
    console.error("Error setting permissions:", error)
    throw error
  }
}

export const isAdmin = (user: any): boolean => {
  return user?.account === "admin"
}

export const hasPermission = async (resourceType: ResourceType, resourceId: string, user: any): Promise<boolean> => {
  const accountId = user?.id
  // 1. 检查是否是管理员
  if (isAdmin(user)) {
    return true
  }

  // 2. 获取资源权限
  const permissions = await getResourcePermissions(resourceType)
  const resourcePermission = permissions[resourceId]

  // 3. 如果资源不存在权限设置，默认为公开访问
  if (!resourcePermission) {
    return true
  }

  // 4. 检查访问控制设置
  if (resourcePermission.isPublic) {
    return true
  }

  if (resourcePermission.requireAuth) {
    return !!user
  }

  // 5. 检查具体权限
  return resourcePermission?.accounts.some((acc) => acc.accountId === accountId) || false
}

export const hasTemplatePermission = async (
  templateId: string,
  requiredRole: TemplatePermissionRole,
  user: any
): Promise<boolean> => {
  if (isAdmin(user)) {
    return true
  }

  const permissions = await getResourcePermissions("template")
  const templatePermission = permissions[templateId]

  if (!templatePermission) {
    return true // 默认公开访问
  }

  if (templatePermission.isPublic) {
    return true
  }

  if (templatePermission.requireAuth) {
    return !!user
  }

  const userPermission = templatePermission.accounts.find((acc) => acc.accountId === user.id)
  if (!userPermission) {
    return false
  }

  const userRoles = Array.isArray(userPermission.role) ? userPermission.role : [userPermission.role]
  return hasRequiredPermission(userRoles, requiredRole)
}

export const getResourceTitle = async (resourceType: ResourceType, resourceId: string): Promise<string> => {
  try {
    switch (resourceType) {
      case "template":
      case "form":
      case "report":
        const result = await getMetadata([`${resourceId}`])
        return result.data?.[0]?.title || resourceId

      case "app":
        const appsResult = await getMetadata(["app_index"])
        const apps = JSON.parse(appsResult.data?.[0]?.value || "[]")
        const app = apps.find((app) => app.id === resourceId)
        return app?.title || resourceId
      default:
        return resourceId
    }
  } catch (error) {
    console.error(`Error getting resource title for ${resourceType}:${resourceId}:`, error)
    return resourceId
  }
}

export const addPermission = async (
  resourceType: ResourceType,
  resourceId: string,
  accountId: string,
  role: string | string[] = "viewer"
) => {
  const permissions = await getResourcePermissions(resourceType)

  if (!permissions[resourceId]) {
    permissions[resourceId] = {
      resourceType,
      resourceId,
      accounts: [],
      isPublic: false, 
      requireAuth: false,
    }
  }

  const existingPermission = permissions[resourceId].accounts.find((acc) => acc.accountId === accountId)

  if (!existingPermission) {
    const roles = Array.isArray(role) ? role : [role]

    if (roles.includes("creator")) {
      roles.push("editor", "viewer")
    } else if (roles.includes("editor")) {
      roles.push("viewer")
    }

    permissions[resourceId].accounts.push({
      accountId,
      role: roles,
      grantedAt: new Date().toISOString(),
      grantedBy: "system",
    })

    await setResourcePermissions(resourceType, permissions)
  }
}

export const createPermissionRequest = async (request: {
  resourceType: ResourceType
  resourceId: string
  requesterId: string
  requesterName: string
  reason: string
  role?: string | string[]
}) => {
  try {
    const result = await getMetadata([PERMISSION_REQUESTS_KEY])
    const existingRequests = JSON.parse(result.data?.[0]?.value || "{}")

    const resourceTitle = await getResourceTitle(request.resourceType, request.resourceId)

    const newRequest = {
      ...request,
      id: `pr_${Date.now()}`,
      status: "pending",
      resourceTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await setMetadata(
      PERMISSION_REQUESTS_KEY,
      JSON.stringify({
        ...existingRequests,
        [newRequest.id]: newRequest,
      })
    )

    return newRequest
  } catch (error) {
    console.error("Error creating permission request:", error)
    throw error
  }
}

export const getPermissionRequests = async () => {
  try {
    const result = await getMetadata([PERMISSION_REQUESTS_KEY])
    return JSON.parse(result.data?.[0]?.value || "{}")
  } catch (error) {
    console.error("Error fetching permission requests:", error)
    return {}
  }
}

export const checkPermissionRequestStatus = async (resourceType: string, resourceId: string, userId: string) => {
  const requests = await getPermissionRequests()
  return Object.values(requests).find(
    (request: any) =>
      request.resourceType === resourceType && request.resourceId === resourceId && request.requesterId === userId
  )
}

export const setResourceAccessControl = async (
  resourceType: ResourceType,
  resourceId: string,
  accessControl: {
    isPublic: boolean
    requireAuth: boolean
  }
): Promise<void> => {
  try {
    // 1. 更新权限信息
    const permissions = await getResourcePermissions(resourceType)
    if (!permissions[resourceId]) {
      permissions[resourceId] = {
        resourceType,
        resourceId,
        accounts: [],
        isPublic: false,
        requireAuth: false,
      }
    }

    permissions[resourceId].isPublic = accessControl.isPublic
    permissions[resourceId].requireAuth = accessControl.requireAuth

    await setResourcePermissions(resourceType, permissions)

    // 2. 如果是 app 类型,同时更新 app_index 和 app 元数据
    if (resourceType === "app") {
      // 更新 app_index
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      const updatedApps = apps.map((app) => {
        if (app.id === resourceId) {
          return {
            ...app,
            accessControl: {
              isPublic: accessControl.isPublic,
              requireAuth: accessControl.requireAuth,
            },
            updatedAt: new Date().toISOString(),
          }
        }
        return app
      })

      await setMetadata("app_index", JSON.stringify(updatedApps))

      // 更新 app 元数据
      const appResult = await getMetadata([resourceId])
      if (appResult.data?.[0]?.value) {
        const appData = JSON.parse(appResult.data[0].value)
        appData.app.accessControl = {
          isPublic: accessControl.isPublic,
          requireAuth: accessControl.requireAuth,
        }
        await setMetadata(resourceId, JSON.stringify(appData))
      }
    }
  } catch (error) {
    console.error("Error setting resource access control:", error)
    throw error
  }
}

export const subscriptionService = {
  async getSubscription(orgId: string): Promise<Subscription | null> {
    try {
      const result = await getMetadata([METADATA_KEYS.SUBSCRIPTION(orgId)])
      return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : null
    } catch (error) {
      console.error("Error getting subscription:", error)
      return null
    }
  },

  async updateSubscription(orgId: string, subscription: Subscription): Promise<void> {
    try {
      const currentSubscription = await this.getSubscription(orgId)

      if (currentSubscription && new Date(currentSubscription.expireDate) > new Date()) {
        const currentExpireDate = new Date(currentSubscription.expireDate)
        const oneMonth = 30 * 24 * 60 * 60 * 1000
        subscription.expireDate = new Date(currentExpireDate.getTime() + oneMonth).toISOString()
      }

      await this.addSubscriptionHistory(orgId, {
        type: subscription.type,
        price: subscription.price,
        purchaseDate: new Date().toISOString(),
        expireDate: subscription.expireDate,
      })

      await setMetadata(METADATA_KEYS.SUBSCRIPTION(orgId), JSON.stringify(subscription))

      const costRecords = await getMetadata(["ai-cost-records"])
      const existingRecords = costRecords?.data[0]?.value ? JSON.parse(costRecords.data[0].value) : []

      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: "subscription",
        totalCost: subscription.price,
        detail: {
          subscription: {
            plan: subscription.type === "personal" ? "个人版" : "企业版",
            duration: 1,
            features: subscription.features,
          },
        },
      }

      await setMetadata("ai-cost-records", [...existingRecords, newRecord])
    } catch (error) {
      console.error("Error updating subscription:", error)
      throw error
    }
  },

  async getAccountUsage(orgId: string): Promise<AccountUsage | null> {
    try {
      const result = await getMetadata([METADATA_KEYS.ACCOUNT_USAGE(orgId)])
      return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : null
    } catch (error) {
      console.error("Error getting account usage:", error)
      return null
    }
  },

  async updateAccountUsage(orgId: string, usage: AccountUsage): Promise<void> {
    try {
      await setMetadata(METADATA_KEYS.ACCOUNT_USAGE(orgId), JSON.stringify(usage))
    } catch (error) {
      console.error("Error updating account usage:", error)
      throw error
    }
  },

  async addSubscriptionHistory(orgId: string, record: SubscriptionHistory): Promise<void> {
    try {
      const result = await getMetadata([METADATA_KEYS.SUBSCRIPTION_HISTORY(orgId)])
      const history = result.data?.[0]?.value ? JSON.parse(result.data[0].value) : []
      history.push(record)
      await setMetadata(METADATA_KEYS.SUBSCRIPTION_HISTORY(orgId), JSON.stringify(history))
    } catch (error) {
      console.error("Error adding subscription history:", error)
      throw error
    }
  },

  async checkSubscriptionStatus(orgId: string): Promise<{
    status: "active" | "expired" | "warning"
    message?: string
    daysToExpire?: number
  }> {
    const subscription = await this.getSubscription(orgId)

    if (!subscription) {
      return {
        status: "expired",
        message: "未找到有效订阅",
      }
    }

    const now = new Date()
    const expireDate = new Date(subscription.expireDate)
    const daysToExpire = Math.floor((expireDate.getTime() - now.getTime()) / (1000 * 3600 * 24))

    if (daysToExpire <= 0) {
      return {
        status: "expired",
        message: "订阅已过期",
      }
    }

    if (daysToExpire <= 7) {
      return {
        status: "warning",
        message: `订阅将在 ${daysToExpire} 天后过期`,
        daysToExpire,
      }
    }

    return {
      status: "active",
      daysToExpire,
    }
  },
}
