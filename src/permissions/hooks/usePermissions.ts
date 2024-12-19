import { useState } from "react"
import { Permission, ResourceType, UsePermissionsReturn } from "../types"
import {
  getResourcePermissions,
  setResourcePermissions,
  hasPermission,
  isAdmin,
} from "../utils/permissionUtils"

export const usePermissions = (resourceType: ResourceType): UsePermissionsReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getPermissions = async (resourceId: string): Promise<Permission | null> => {
    try {
      setLoading(true)
      const permissions = await getResourcePermissions(resourceType)
      return permissions[resourceId] || null
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get permissions")
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = async (resourceId: string, accountId: string): Promise<boolean> => {
    try {
      setLoading(true)
      // 添加admin权限判断
      if (isAdmin(accountId)) {
        return true
      }
      const permission = await getPermissions(resourceId)
      return hasPermission(permission, accountId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to check permission")
      setError(error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const grantPermission = async (resourceId: string, accountId: string, role: string): Promise<void> => {
    try {
      setLoading(true)
      const permissions = await getResourcePermissions(resourceType)
      
      if (!permissions[resourceId]) {
        permissions[resourceId] = {
          resourceType,
          resourceId,
          accounts: []
        }
      }

      // Remove existing permission for this account if exists
      permissions[resourceId].accounts = permissions[resourceId].accounts.filter(
        (acc) => acc.accountId !== accountId
      )

      // Add new permission
      permissions[resourceId].accounts.push({
        accountId,
        role,
        grantedAt: new Date().toISOString(),
        grantedBy: "currentUser" // TODO: Get from context
      })

      await setResourcePermissions(resourceType, permissions)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to grant permission")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const revokePermission = async (resourceId: string, accountId: string): Promise<void> => {
    try {
      setLoading(true)
      const permissions = await getResourcePermissions(resourceType)
      
      if (permissions[resourceId]) {
        permissions[resourceId].accounts = permissions[resourceId].accounts.filter(
          (acc) => acc.accountId !== accountId
        )
        await setResourcePermissions(resourceType, permissions)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to revoke permission")
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    getPermissions,
    checkPermission,
    grantPermission,
    revokePermission,
    loading,
    error
  }
}