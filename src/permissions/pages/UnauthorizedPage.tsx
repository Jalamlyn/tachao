import React from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ResourceType } from "../types"
import { getUnauthorizedContent } from "../config/unauthorizedContent"

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resourceType = searchParams.get("type") as ResourceType
  const resourceId = searchParams.get("id") || ""

  const content = getUnauthorizedContent(resourceType, resourceId, {
    onBack: () => navigate(-1),
    onRequestAccess: () => {
      // 实现权限申请逻辑
      console.log(`Requesting access for ${resourceType}:${resourceId}`)
    },
  })

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary-50 to-background'>
      <div className='text-center space-y-6'>
        <Icon icon={content.icon} className='w-24 h-24 text-danger mx-auto' />
        <h1 className='text-3xl font-bold text-foreground'>{content.title}</h1>
        <p className='text-default-600 max-w-md'>{content.description}</p>
        <div className='flex gap-4 justify-center'>
          {content.actions.primary && (
            <Button
              color='primary'
              variant='flat'
              startContent={<Icon icon='solar:shield-user-bold-duotone' />}
              onPress={content.actions.primary.action}
            >
              {content.actions.primary.label}
            </Button>
          )}
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
