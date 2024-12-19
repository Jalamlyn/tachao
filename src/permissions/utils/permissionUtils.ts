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

  const userPermission = templatePermission.accounts.find(acc => acc.accountId === user.id)
  if (!userPermission) {
    return false
  }

  // 如果检查编辑权限，需要同时具有查看权限
  if (requiredRole === 'editor') {
    return userPermission.role.includes('editor') && userPermission.role.includes('viewer')
  }

  return userPermission.role.includes(requiredRole)
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

  // 检查是否已存在权限
  const existingPermission = permissions[resourceId].accounts.find((acc) => acc.accountId === accountId)

  if (!existingPermission) {
    permissions[resourceId].accounts.push({
      accountId,
      role: Array.isArray(role) ? role : [role],
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
}) => {
  try {
    const result = await getMetadata([PERMISSION_REQUESTS_KEY])
    const existingRequests = JSON.parse(result.data?.[0]?.value || "{}")

    const newRequest = {
      ...request,
      id: `pr_${Date.now()}`,
      status: "pending",
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