import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { Permission, PermissionMetadata, ResourceType } from "../types"

const PERMISSION_REQUESTS_KEY = 'permission_requests'

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

export const hasPermission = (permission: Permission | null, accountId: string): boolean => {
  if (!permission) return false
  if (isAdmin({ account: accountId })) return true
  return permission.accounts.some((acc) => acc.accountId === accountId)
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
    const existingRequests = JSON.parse(result.data?.[0]?.value || '{}')
    
    const newRequest = {
      ...request,
      id: `pr_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await setMetadata(PERMISSION_REQUESTS_KEY, JSON.stringify({
      ...existingRequests,
      [newRequest.id]: newRequest
    }))

    return newRequest
  } catch (error) {
    console.error("Error creating permission request:", error)
    throw error
  }
}

export const getPermissionRequests = async () => {
  try {
    const result = await getMetadata([PERMISSION_REQUESTS_KEY])
    return JSON.parse(result.data?.[0]?.value || '{}')
  } catch (error) {
    console.error("Error fetching permission requests:", error)
    return {}
  }
}