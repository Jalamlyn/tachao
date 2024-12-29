import React from "react"
import { Card, CardBody, CardFooter, Button, Chip, useDisclosure } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex, useAppStore } from "../store/useAppStore"
import { PermissionModal } from "@/permissions/components/PermissionModal"

interface AppCardProps {
  app: AppIndex
  onDevelopClick: (app: AppIndex) => void
}

export const AppCard: React.FC<AppCardProps> = ({ app, onDevelopClick }) => {
  const navigate = useNavigate()
  const { setDeleteModalOpen, setAppToDelete } = useAppStore()
  const {
    isOpen: isPermissionModalOpen,
    onOpen: onPermissionModalOpen,
    onClose: onPermissionModalClose,
  } = useDisclosure()

  const handleDelete = () => {
    setAppToDelete(app)
    setDeleteModalOpen(true)
  }

  const getTemplateIcon = (template?: string) => {
    switch (template) {
      case "enterprise":
        return "mdi:building"
      case "dashboard":
        return "mdi:view-dashboard-outline"
      default:
        return "mdi:view-grid-outline"
    }
  }

  const getTemplateColor = (template?: string) => {
    switch (template) {
      case "enterprise":
        return "text-blue-500"
      case "dashboard":
        return "text-secondary"
      default:
        return "text-primary"
    }
  }

  const getTemplateLabel = (template?: string) => {
    switch (template) {
      case "enterprise":
        return "企业级应用"
      case "dashboard":
        return "仪表盘模板"
      default:
        return "默认模板"
    }
  }

  return (
    <>
      <Card className='w-full hover:shadow-lg transition-shadow duration-300'>
        <CardBody className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 rounded-lg bg-primary/10'>
              <Icon icon={getTemplateIcon(app.template)} className={`w-6 h-6 ${getTemplateColor(app.template)}`} />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <h3 className='text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis'>{app.title}</h3>
              </div>
              <p className='text-small text-default-500'>创建于 {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardBody>
        <CardFooter className='gap-2'>
          <Button
            size='sm'
            variant='flat'
            startContent={<Icon icon='mdi:eye' className='w-4 h-4' />}
            onPress={() => window.open(`/app-run/${app.id}`, "_blank")}
          >
            访问应用
          </Button>
          <Button
            size='sm'
            color='primary'
            startContent={<Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />}
            onPress={() => navigate(`/we-chat-app/admin/apps/${app.id}/builder`)}
          >
            开发应用
          </Button>
          <Button
            size='sm'
            variant='light'
            color='secondary'
            startContent={<Icon icon='mdi:shield-account' className='w-4 h-4' />}
            onPress={onPermissionModalOpen}
          >
            权限管理
          </Button>

          <Button
            size='sm'
            variant='light'
            color='danger'
            startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
            onPress={handleDelete}
          >
            删除
          </Button>
        </CardFooter>
      </Card>

      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={onPermissionModalClose}
        resourceType='app'
        resourceId={app.id}
        resourceTitle={app.title}
      />
    </>
  )
}
