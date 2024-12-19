import React, { useState, useEffect } from "react"
import { Button, Textarea } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ResourceType } from "../types"
import { getUnauthorizedContent } from "../config/unauthorizedContent"
import { createPermissionRequest, getPermissionRequests } from "../utils/permissionUtils"
import { useCurrentUser } from "../hooks/useCurrentUser"
import message from "@/components/Message"

const PermissionRequestForm = ({ resourceType, resourceId }: { resourceType: string, resourceId: string }) => {
  const { user } = useCurrentUser()
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')

  useEffect(() => {
    checkExistingRequest()
  }, [])

  const checkExistingRequest = async () => {
    if (!user) return
    
    try {
      const requests = await getPermissionRequests()
      const existingRequest = Object.values(requests).find((request: any) => 
        request.resourceType === resourceType && 
        request.resourceId === resourceId &&
        request.requesterId === user.id
      )
      
      if (existingRequest) {
        setRequestStatus(existingRequest.status)
      }
    } catch (error) {
      console.error('Error checking existing request:', error)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      message.error('请先登录')
      return
    }

    if (!reason.trim()) {
      message.error('请输入申请原因')
      return
    }

    setIsSubmitting(true)
    try {
      await createPermissionRequest({
        resourceType: resourceType as ResourceType,
        resourceId,
        requesterId: user.id,
        requesterName: user.name || user.id,
        reason: reason.trim()
      })

      setRequestStatus('pending')
      message.success('权限申请已提交')
    } catch (error) {
      console.error('Error submitting permission request:', error)
      message.error('申请提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (requestStatus === 'pending') {
    return (
      <div className="mt-4 p-4 bg-primary-50 rounded-lg">
        <div className="flex items-center gap-2 text-primary">
          <Icon icon="solar:clock-circle-bold-duotone" />
          <span>您的权限申请正在审核中，请耐心等待</span>
        </div>
      </div>
    )
  }

  if (requestStatus === 'rejected') {
    return (
      <div className="mt-4 p-4 bg-danger-50 rounded-lg">
        <div className="flex items-center gap-2 text-danger">
          <Icon icon="solar:close-circle-bold-duotone" />
          <span>您的权限申请已被拒绝，如有疑问请联系管理员</span>
        </div>
      </div>
    )
  }

  if (requestStatus === 'approved') {
    return (
      <div className="mt-4 p-4 bg-success-50 rounded-lg">
        <div className="flex items-center gap-2 text-success">
          <Icon icon="solar:check-circle-bold-duotone" />
          <span>您的权限申请已通过，请刷新页面</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      <Textarea
        label="申请原因"
        placeholder="请详细说明您需要访问该资源的原因..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={isSubmitting}
      />
      <Button
        color="primary"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        startContent={<Icon icon="solar:shield-user-bold-duotone" />}
      >
        提交权限申请
      </Button>
    </div>
  )
}

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resourceType = searchParams.get("type") as ResourceType
  const resourceId = searchParams.get("id") || ""

  const content = getUnauthorizedContent(resourceType, resourceId, {
    onBack: () => navigate(-1),
    onRequestAccess: () => {
      // 权限申请功能已通过表单实现
    },
  })

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary-50 to-background'>
      <div className='text-center space-y-6'>
        <Icon icon={content.icon} className='w-24 h-24 text-danger mx-auto' />
        <h1 className='text-3xl font-bold text-foreground'>{content.title}</h1>
        <p className='text-default-600 max-w-md'>{content.description}</p>
        <PermissionRequestForm resourceType={resourceType} resourceId={resourceId} />
        <div className='flex gap-4 justify-center mt-4'>
          {content.actions.secondary && (
            <Button
              color='secondary'
              variant='light'
              startContent={<Icon icon='solar:arrow-left-bold-duotone' />}
              onPress={content.actions.secondary.action}
            >
              {content.actions.secondary.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage