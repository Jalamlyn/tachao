import { useEffect, useState } from "react"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { hasPermission, hasTemplatePermission } from "../utils/permissionUtils"
import { Spinner } from "@nextui-org/react"
import { Navigate } from "react-router-dom"
import { ResourceType, TemplatePermissionRole } from "../types"

interface PermissionCheckProps {
  resourceType: ResourceType
  resourceId: string
  role?: TemplatePermissionRole  // 新增：用于模板权限检查
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  resourceType,
  resourceId,
  role,
  children,
  fallback = <Navigate to={`/unauthorized?type=${resourceType}&id=${resourceId}`} />,
}) => {
  const { user, isLoading: userLoading } = useCurrentUser()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return

      try {
        let result = false
        
        // 如果是模板资源且指定了角色，使用模板特定的权限检查
        if (resourceType === "template" && role) {
          result = await hasTemplatePermission(resourceId, role, user)
        } else {
          // 其他资源使用通用权限检查
          result = await hasPermission(resourceType, resourceId, user)
        }
        
        setHasAccess(result)
      } catch (error) {
        console.error("Permission check failed:", error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    if (!userLoading) {
      checkAccess()
    }
  }, [resourceId, user, userLoading, resourceType, role])

  if (userLoading || loading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Spinner size='sm' />
      </div>
    )
  }

  if (!user) {
    return <>{fallback}</>
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}