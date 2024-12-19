import React, { useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"
import { usePermissions } from "../hooks/usePermissions"
import { ResourceType } from "../types"

interface PermissionCheckProps {
  resourceType: ResourceType
  resourceId: string
  accountId: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  resourceType,
  resourceId,
  accountId,
  children,
  fallback = <div>无访问权限</div>
}) => {
  const { checkPermission } = usePermissions(resourceType)
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const result = await checkPermission(resourceId, accountId)
        setHasPermission(result)
      } catch (error) {
        console.error("Permission check failed:", error)
        setHasPermission(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [resourceId, accountId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="sm" />
      </div>
    )
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>
}