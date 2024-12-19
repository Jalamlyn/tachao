import { useState, useEffect } from "react"
import { Button, Textarea, Radio, RadioGroup } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { ResourceType, TemplatePermissionRole } from "../types"
import { createPermissionRequest, getPermissionRequests } from "../utils/permissionUtils"
import { useCurrentUser } from "../hooks/useCurrentUser"
import message from "@/components/Message"
import { motion } from "framer-motion"

const PermissionRequestForm = ({
  resourceType,
  resourceId,
  metadata,
}: {
  resourceType: string
  resourceId: string
  metadata?: {
    role?: TemplatePermissionRole
  }
}) => {
  const { user } = useCurrentUser()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "approved" | "rejected">("none")
  const [selectedRole, setSelectedRole] = useState<TemplatePermissionRole>(metadata?.role || "viewer")

  useEffect(() => {
    checkExistingRequest()
  }, [])

  const checkExistingRequest = async () => {
    if (!user) return

    try {
      const requests = await getPermissionRequests()
      const existingRequest = Object.values(requests).find(
        (request: any) =>
          request.resourceType === resourceType && request.resourceId === resourceId && request.requesterId === user.id
      )

      if (existingRequest) {
        setRequestStatus(existingRequest.status)
      }
    } catch (error) {
      console.error("Error checking existing request:", error)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      message.error("请先登录")
      return
    }

    if (!reason.trim()) {
      message.error("请输入申请原因")
      return
    }

    setIsSubmitting(true)
    try {
      // 处理权限包含关系
      let finalRole = selectedRole
      if (resourceType === 'template') {
        if (selectedRole === 'editor') {
          finalRole = ['editor', 'viewer']
        } else {
          finalRole = [selectedRole]
        }
      }

      await createPermissionRequest({
        resourceType: resourceType as ResourceType,
        resourceId,
        requesterId: user.id,
        requesterName: user.name || user.id,
        reason: reason.trim(),
        role: finalRole,
      })

      setRequestStatus("pending")
      message.success("权限申请已提交")
    } catch (error) {
      console.error("Error submitting permission request:", error)
      message.error("申请提交失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusContent = () => {
    const statusConfig = {
      pending: {
        icon: "solar:clock-circle-bold-duotone",
        text: "您的权限申请正在审核中，请耐心等待",
        color: "bg-primary-50",
        textColor: "text-primary",
      },
      rejected: {
        icon: "solar:close-circle-bold-duotone",
        text: "您的权限申请已被拒绝，如有疑问请联系管理员",
        color: "bg-danger-50",
        textColor: "text-danger",
      },
      approved: {
        icon: "solar:check-circle-bold-duotone",
        text: "您的权限申请已通过，请刷新页面",
        color: "bg-success-50",
        textColor: "text-success",
      },
    }

    if (requestStatus === "none") return null

    const config = statusConfig[requestStatus]
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-4 p-4 rounded-lg ${config.color}`}
      >
        <div className={`flex items-center gap-2 ${config.textColor}`}>
          <Icon icon={config.icon} className='w-5 h-5' />
          <span>{config.text}</span>
        </div>
      </motion.div>
    )
  }

  if (requestStatus !== "none") {
    return getStatusContent()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mt-4 space-y-4'>
      {resourceType === "template" && (
        <RadioGroup
          label='申请权限类型'
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as TemplatePermissionRole)}
          description="选择编辑权限将自动包含查看权限"
        >
          <Radio value='viewer'>查看权限</Radio>
          <Radio value='editor'>编辑权限（包含查看权限）</Radio>
        </RadioGroup>
      )}

      <Textarea
        label='申请原因'
        placeholder='请详细说明您需要访问该资源的原因...'
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={isSubmitting}
        classNames={{
          input: "min-h-[100px]",
          label: "text-default-700",
        }}
        variant='bordered'
      />
      <div className='flex justify-end'>
        <Button
          color='primary'
          onPress={handleSubmit}
          isLoading={isSubmitting}
          startContent={<Icon icon='solar:shield-user-bold-duotone' className='w-5 h-5' />}
          className='px-6'
          size='sm'
        >
          提交权限申请
        </Button>
      </div>
    </motion.div>
  )
}

export default PermissionRequestForm