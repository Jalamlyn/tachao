import { useEffect, useState } from "react"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { usePermissions } from "../hooks/usePermissions"
import { Spinner } from "@nextui-org/react"
import { Navigate } from "react-router-dom"

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  resourceType,
  resourceId,
  children,
  fallback = <Navigate to={`/unauthorized?type=${resourceType}&id=${resourceId}`} />,
}) => {
  const { user, isLoading: userLoading } = useCurrentUser()
  const { checkPermission } = usePermissions(resourceType)
  const [hasPermission, setHasPermission] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return

      try {
        const result = await checkPermission(resourceId, user.id, user)
        setHasPermission(result)
      } catch (error) {
        console.error("Permission check failed:", error)
        setHasPermission(false)
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

  // 如果没有用户信息，显示未授权状态
  if (!user) {
    return <>{fallback}</>
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>
}
