import React from "react"
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex, useAppStore } from "../store/useAppStore"
import { PermissionModal } from "@/app/admin/src/permissions/components/PermissionModal"

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

  const getTemplateGradient = (template?: string) => {
    switch (template) {
      case "enterprise":
        return "from-blue-100 to-blue-50"
      case "dashboard":
        return "from-secondary-100 to-secondary-50"
      default:
        return "from-primary-100 to-primary-50"
    }
  }

  return (
    <>
      <Card
        className='w-full group hover:shadow-lg transition-all duration-300 border border-default-200'
        role='article'
        aria-label={`应用卡片: ${app.title}`}
      >
        <CardBody className='p-5'>
          <div className='flex items-center gap-5'>
            <div
              className={`p-4 rounded-xl bg-gradient-to-br ${getTemplateGradient(app.template)} transform group-hover:scale-105 transition-all duration-300`}
            >
              <Icon
                icon={getTemplateIcon(app.template)}
                className={`w-8 h-8 ${getTemplateColor(app.template)}`}
                aria-hidden='true'
              />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-xl font-bold tracking-tight truncate mb-1'>{app.title}</h3>
              <p className='text-small text-default-500'>创建于 {new Date(app.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardBody>
        <CardFooter className='px-5 py-4 gap-3 border-t border-default-200'>
          <Button
            size='sm'
            variant='flat'
            className='flex-1 group-hover:bg-default-100 transition-colors duration-200'
            startContent={
              <Icon
                icon='mdi:eye'
                className='w-4 h-4 transform group-hover:scale-110 transition-transform duration-200'
                aria-hidden='true'
              />
            }
            onPress={() => window.open(`/app-run/${app.id}`, "_blank")}
          >
            访问应用
          </Button>
          <Button
            size='sm'
            color='primary'
            className='flex-1 transform hover:scale-105 transition-transform duration-200'
            startContent={<Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' aria-hidden='true' />}
            onPress={() => navigate(`/admin/apps/${app.id}/builder`)}
          >
            开发应用
          </Button>

          <Dropdown>
            <DropdownTrigger>
              <Button size='sm' variant='light' isIconOnly className='group-hover:bg-default-100'>
                <Icon icon='mdi:dots-vertical' className='w-5 h-5' />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='应用操作'>
              <DropdownItem
                key='permissions'
                startContent={<Icon icon='mdi:shield-account' className='w-4 h-4' />}
                onPress={onPermissionModalOpen}
              >
                权限管理
              </DropdownItem>
              <DropdownItem
                key='delete'
                className='text-danger'
                color='danger'
                startContent={<Icon icon='mdi:delete' className='w-4 h-4' />}
                onPress={handleDelete}
              >
                删除应用
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
