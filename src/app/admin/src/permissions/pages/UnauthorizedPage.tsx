import React, { useEffect } from "react"
import { Button, Card, CardBody, Divider } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ResourceType } from "../types"
import { getUnauthorizedContent } from "../config/unauthorizedContent"
import { motion, AnimatePresence } from "framer-motion"
import { queryMyProjectApps } from "@/service/apis/app"
import { localDB } from "@/utils/localDB"
import PermissionRequestForm from "./PermissionRequestForm"

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resourceType = searchParams.get("type") as ResourceType
  const resourceId = searchParams.get("id") || ""

  useEffect(() => {
    const initAppId = async () => {
      try {
        const response = await queryMyProjectApps({ page: 1, size: 1 })
        if (response.data[0].id) {
          localDB.setAppId(response.data[0])
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
    <div className='min-h-screen bg-gradient-to-b from-primary-50/50 to-background flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-2xl'
      >
        <Card className='shadow-xl backdrop-blur-sm bg-background/80'>
          <CardBody className='p-8 space-y-6'>
            <div className='text-center space-y-4'>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className='inline-block p-4 rounded-full bg-default-100'
              >
                <Icon icon='solar:lock-bold-duotone' className='w-16 h-16 text-default-500' />
              </motion.div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className='text-3xl font-bold text-foreground'
              >
                {content.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='text-lg text-default-600 max-w-md mx-auto'
              >
                {content.description}
              </motion.p>
            </div>

            <Divider className='my-6' />

            <AnimatePresence mode='wait'>
              <PermissionRequestForm resourceType={resourceType} resourceId={resourceId} metadata={content.metadata} />
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className='flex gap-4 justify-center mt-8'
            >
              {content.actions.secondary && (
                <Button
                  color='default'
                  variant='bordered'
                  startContent={<Icon icon='solar:arrow-left-bold-duotone' className='w-5 h-5' />}
                  onPress={content.actions.secondary.action}
                  size='lg'
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
