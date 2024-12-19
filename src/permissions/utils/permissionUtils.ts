import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { Permission, PermissionMetadata, ResourceType } from "../types"

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
  return user.account === "admin"
}

export const hasPermission = (permission: Permission | null, accountId: string): boolean => {
  if (!permission) return false
  if (isAdmin(accountId)) return true
  return permission.accounts.some((acc) => acc.accountId === accountId)
}
