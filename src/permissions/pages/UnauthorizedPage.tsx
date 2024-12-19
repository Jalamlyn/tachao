import React, { useState, useEffect } from "react"
import { Button, Textarea, Card, CardBody, Divider } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ResourceType } from "../types"
import { getUnauthorizedContent } from "../config/unauthorizedContent"
import { createPermissionRequest, getPermissionRequests } from "../utils/permissionUtils"
import { useCurrentUser } from "../hooks/useCurrentUser"
import message from "@/components/Message"
import { motion, AnimatePresence } from "framer-motion"
import { queryMyProjectApps } from "@/service/apis/app"
import { localDB } from "@/utils/localDB"

const PermissionRequestForm = ({ resourceType, resourceId }: { resourceType: string; resourceId: string }) => {
  const { user } = useCurrentUser()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "approved" | "rejected">("none")

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
      await createPermissionRequest({
        resourceType: resourceType as ResourceType,
        resourceId,
        requesterId: user.id,
        requesterName: user.name || user.id,
        reason: reason.trim(),
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
          <Icon icon={config.icon} className="w-5 h-5" />
          <span>{config.text}</span>
        </div>
      </motion.div>
    )
  }

  if (requestStatus !== "none") {
    return getStatusContent()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
      <Textarea
        label="申请原因"
        placeholder="请详细说明您需要访问该资源的原因..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={isSubmitting}
        classNames={{
          input: "min-h-[100px]",
          label: "text-default-700",
        }}
        variant="bordered"
      />
      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          startContent={<Icon icon="solar:shield-user-bold-duotone" className="w-5 h-5" />}
          className="px-6"
          size="lg"
        >
          提交权限申请
        </Button>
      </div>
    </motion.div>
  )
}

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resourceType = searchParams.get("type") as ResourceType
  const resourceId = searchParams.get("id") || ""

  useEffect(() => {
    const initAppId = async () => {
      try {
        const response = await queryMyProjectApps({ page: 1, size: 1 })
        if (response.items && response.items.length > 0) {
          const firstApp = response.items[0]
          await localDB.setAppId(firstApp.id)
        }
      } catch (error) {
        console.error("Error initializing appId:", error)
      }
    }

    initAppId()
  }, [])

  const content = getUnauthorizedContent(resourceType, resourceId, {
    onBack: () => navigate(-1),
    onRequestAccess: () => {
      // 权限申请功能已通过表单实现
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl backdrop-blur-sm bg-background/80">
          <CardBody className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block p-4 rounded-full bg-danger-50"
              >
                <Icon icon={content.icon} className="w-16 h-16 text-danger" />
              </motion.div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-foreground"
              >
                {content.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-default-600 max-w-md mx-auto"
              >
                {content.description}
              </motion.p>
            </div>

            <Divider className="my-6" />

            <AnimatePresence mode="wait">
              <PermissionRequestForm resourceType={resourceType} resourceId={resourceId} />
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 justify-center mt-8"
            >
              {content.actions.secondary && (
                <Button
                  color="default"
                  variant="bordered"
                  startContent={<Icon icon="solar:arrow-left-bold-duotone" className="w-5 h-5" />}
                  onPress={content.actions.secondary.action}
                  size="lg"
                >
                  {content.actions.secondary.label}
                </Button>
              )}
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

export default UnauthorizedPage