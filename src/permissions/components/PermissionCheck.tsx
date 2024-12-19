import { useEffect, useState } from "react"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { hasPermission } from "../utils/permissionUtils"
import { Spinner } from "@nextui-org/react"
import { Navigate } from "react-router-dom"

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  resourceType,
  resourceId,
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
        // 直接检查权限，不需要检查申请状态
        const result = await hasPermission(resourceType, resourceId, user)
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
  }, [resourceId, user, userLoading])

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
