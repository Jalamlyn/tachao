import { useEffect, useState } from "react"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { checkPermissionRequestStatus, hasPermission, hasTemplatePermission, subscriptionService } from "../utils/permissionUtils"
import { Spinner } from "@nextui-org/react"
import { Navigate } from "react-router-dom"
import { ResourceType, TemplatePermissionRole } from "../types"
import message from "@/components/Message"

interface PermissionCheckProps {
  resourceType: ResourceType
  resourceId: string
  role?: TemplatePermissionRole // 用于模板权限检查
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
  const [requestStatus, setRequestStatus] = useState<{
    status: "none" | "pending" | "approved" | "rejected"
    requestId?: string
    createdAt?: string
    updatedAt?: string
  }>({
    status: "none",
  })

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // 1. 检查订阅状态
        const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(user.organizationId)
        if (subscriptionStatus.status === 'expired') {
          message.warning('组织订阅已过期，请续费')
          setHasAccess(false)
          setLoading(false)
          return
        }

        // 2. 检查账号类型权限
        if (user.name.startsWith('wb_') && resourceType === 'page') {
          setHasAccess(false)
          setLoading(false)
          return
        }

        // 3. 检查具体权限
        let result = false
        if (resourceType === "template" && role) {
          result = await hasTemplatePermission(resourceId, role, user)
        } else {
          result = await hasPermission(resourceType, resourceId, user)
        }

        if (!result) {
          // 4. 如果没有权限，检查是否有申请在处理中
          const request = await checkPermissionRequestStatus(resourceType, resourceId, user.id)
          if (request) {
            setRequestStatus({
              status: request.status,
              requestId: request.id,
              createdAt: request.createdAt,
              updatedAt: request.updatedAt,
            })
          } else {
            setRequestStatus({ status: "none" })
          }
        }

        setHasAccess(result)
      } catch (error) {
        console.error("Permission check failed:", error)
        setHasAccess(false)
        setRequestStatus({ status: "none" })
      } finally {
        setLoading(false)
      }
    }

    if (!userLoading) {
      checkAccess()
    }
  }, [resourceId, user, userLoading, resourceType, role])

  // 处理加载状态
  if (userLoading || loading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Spinner size='sm' />
      </div>
    )
  }

  // 处理未登录状态
  if (!user) {
    return <>{fallback}</>
  }

  // 如果有权限，显示子组件
  if (hasAccess) {
    return <>{children}</>
  }

  // 如果没有权限，根据申请状态显示不同内容
  if (requestStatus.status !== "none") {
    // 将申请状态传递给 fallback 组件
    const unauthorizedParams = new URLSearchParams({
      type: resourceType,
      id: resourceId,
      ...(role && { role }),
      requestStatus: requestStatus.status,
      ...(requestStatus.requestId && { requestId: requestStatus.requestId }),
      ...(requestStatus.createdAt && { createdAt: requestStatus.createdAt }),
      ...(requestStatus.updatedAt && { updatedAt: requestStatus.updatedAt }),
    })

    return <Navigate to={`/unauthorized?${unauthorizedParams.toString()}`} />
  }

  // 默认显示未授权页面
  return <>{fallback}</>
}