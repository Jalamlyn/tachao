import React, { useState } from "react"
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  RadioGroup,
  Radio,
  Chip,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex, useAppStore } from "../store/useAppStore"
import { PermissionModal } from "@/app/admin/src/permissions/components/PermissionModal"
import message from "@/components/Message"
import { color } from "framer-motion"

interface AppCardProps {
  app: AppIndex
  onDevelopClick: (app: AppIndex) => void
}

export const AppCard: React.FC<AppCardProps> = ({ app, onDevelopClick }) => {
  const navigate = useNavigate()
  const [newTitle, setNewTitle] = useState(app.title)
  const { setDeleteModalOpen, setAppToDelete, useRenameApp, useUpdateAppConfig } = useAppStore()
  const {
    isOpen: isPermissionModalOpen,
    onOpen: onPermissionModalOpen,
    onClose: onPermissionModalClose,
  } = useDisclosure()
  const { isOpen: isRenameModalOpen, onOpen: onRenameModalOpen, onClose: onRenameModalClose } = useDisclosure()

  const { renameApp, isRenaming } = useRenameApp()
  const { updateAppConfig, isUpdating } = useUpdateAppConfig()

  const handleDelete = () => {
    setAppToDelete(app)
    setDeleteModalOpen(true)
  }

  const handleRename = async () => {
    try {
      await renameApp({ id: app.id, title: newTitle })
      onRenameModalClose()
    } catch (error) {
      console.error("Failed to rename app:", error)
    }
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(app.id)
      message.success("应用ID已复制到剪贴板")
    } catch (error) {
      console.error("Failed to copy app ID:", error)
      message.error("复制失败")
    }
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

  const getAccessControlLabel = () => {
    if (app.accessControl?.isPublic)
      return {
        color: "success",
        label: "所有用户可访问",
      }
    if (app.accessControl?.requireAuth)
      return {
        color: "primary",
        label: "所有登录用户可访问",
      }
    return {
      color: "default",
      label: "指定用户可访问",
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
              <div className='flex items-center gap-2'>
                <p className='text-small text-default-500'>创建于 {new Date(app.createdAt).toLocaleDateString()}</p>
                <Chip size='sm' variant='flat' color={getAccessControlLabel().color}>
                  {getAccessControlLabel().label}
                </Chip>
              </div>
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
          <Button
            size='sm'
            variant='flat'
            color='danger'
            startContent={<Icon icon='mdi:shield-lock' className='w-4 h-4' />}
            onPress={onPermissionModalOpen}
          >
            访问控制
          </Button>

          <Dropdown>
            <DropdownTrigger>
              <Button size='sm' variant='light' isIconOnly className='group-hover:bg-default-100'>
                <Icon icon='mdi:dots-vertical' className='w-5 h-5' />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='应用操作'>
              <DropdownItem
                key='copy-id'
                startContent={
                  <Icon
                    icon='mdi:content-copy'
                    className='w-4 h-4 transform group-hover:scale-110 transition-transform duration-200'
                    aria-hidden='true'
                  />
                }
                onPress={handleCopyId}
              >
                复制ID
              </DropdownItem>
              <DropdownItem
                key='rename'
                startContent={<Icon icon='mdi:pencil' className='w-4 h-4' />}
                onPress={onRenameModalOpen}
              >
                重命名
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

      <Modal
        isOpen={isRenameModalOpen}
        onClose={onRenameModalClose}
        classNames={{
          base: "max-w-md",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>重命名应用</ModalHeader>
          <ModalBody>
            <Input
              label='应用名称'
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              variant='bordered'
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onRenameModalClose}>
              取消
            </Button>
            <Button
              color='primary'
              onPress={handleRename}
              isLoading={isRenaming}
              isDisabled={!newTitle.trim() || newTitle.trim() === app.title}
            >
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
