import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { Permission, PermissionMetadata, ResourceType, TemplatePermissionRole } from "../types"

const PERMISSION_REQUESTS_KEY = "permission_requests"

export const getPermissionMetadataKey = (resourceType: ResourceType) => `permissions_${resourceType}`

export const getResourcePermissions = async (resourceType: ResourceType): Promise<PermissionMetadata> => {
  const key = getPermissionMetadataKey(resourceType)
  try {
    const result = await getMetadata([key])
    const data = result.data?.[0]?.value
    return data ? JSON.parse(data) : {}
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

  // 2. 只检查实际权限
  const permissions = await getResourcePermissions(resourceType)
  const resourcePermission = permissions[resourceId]
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
    return false
  }

  const userPermission = templatePermission.accounts.find((acc) => acc.accountId === user.id)
  if (!userPermission) {
    return false
  }

  const userRoles = Array.isArray(userPermission.role) ? userPermission.role : [userPermission.role]

  // 权限层级检查
  if (requiredRole === "viewer") {
    return userRoles.includes("viewer") || 
           userRoles.includes("editor") || 
           userRoles.includes("creator")
  }

  if (requiredRole === "editor") {
    return userRoles.includes("editor") || 
           userRoles.includes("creator")
  }

  if (requiredRole === "creator") {
    return userRoles.includes("creator")
  }

  return false
}

// 新增：获取资源标题的函数
export const getResourceTitle = async (resourceType: ResourceType, resourceId: string): Promise<string> => {
  try {
    switch (resourceType) {
      case "template":
      case "form":
      case "report":
        const result = await getMetadata([`${resourceType}_${resourceId}`])
        return result.data?.[0]?.title || resourceId

      case "app":
        // 从元数据中获取应用信息
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
    }
  }

  const existingPermission = permissions[resourceId].accounts.find((acc) => acc.accountId === accountId)

  if (!existingPermission) {
    const roles = Array.isArray(role) ? role : [role]

    // 处理权限包含关系
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

    // 获取资源标题
    const resourceTitle = await getResourceTitle(request.resourceType, request.resourceId)

    const newRequest = {
      ...request,
      id: `pr_${Date.now()}`,
      status: "pending",
      resourceTitle, // 添加资源标题
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