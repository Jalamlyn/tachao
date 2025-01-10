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
  Avatar,
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
        return "from-blue-100 via-blue-50 to-blue-100"
      case "dashboard":
        return "from-secondary-100 via-secondary-50 to-secondary-100"
      default:
        return "from-primary-100 via-primary-50 to-primary-100"
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
        isBlurred
        className="border-none bg-background/60 dark:bg-default-100/50 w-full group hover:shadow-xl transition-all duration-300 overflow-hidden"
        shadow="sm"
      >
        <CardBody className="p-0">
          <div className="grid grid-cols-12 items-stretch">
            {/* 左侧图标区域 - 现代化设计 */}
            <div className="col-span-4 md:col-span-3 relative overflow-hidden">
              <div
                className={`
                  absolute inset-0 
                  bg-gradient-to-br ${getTemplateGradient(app.template)}
                  transform group-hover:scale-105 transition-all duration-500
                  flex items-center justify-center
                `}
              >
                <div className="relative z-10 p-6">
                  <Icon 
                    icon={getTemplateIcon(app.template)} 
                    className={`w-12 h-12 ${getTemplateColor(app.template)} transform group-hover:scale-110 transition-transform duration-300`} 
                  />
                </div>
                {/* 装饰性背景图案 */}
                <div className="absolute inset-0 opacity-10">
                  <Icon 
                    icon={getTemplateIcon(app.template)} 
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* 右侧信息区域 - 优化布局 */}
            <div className="col-span-8 md:col-span-9 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-xl font-bold tracking-tight truncate group-hover:text-primary transition-colors">
                    {app.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-small text-default-500">
                      创建于 {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color={getAccessControlLabel().color}
                      className="transition-transform group-hover:scale-105"
                    >
                      {getAccessControlLabel().label}
                    </Chip>
                  </div>
                </div>

                {/* 创建者信息 - 改进视觉效果 */}
                {app.creator && (
                  <div className="flex items-center gap-2 bg-default-100/50 backdrop-blur-sm px-3 py-1 rounded-full transform group-hover:translate-y-1 transition-transform">
                    <Avatar 
                      size="sm" 
                      src={app.creator.avatar} 
                      name={app.creator.name} 
                      className="w-6 h-6 ring-2 ring-primary/10"
                    />
                    <span className="text-small text-default-600">{app.creator.name}</span>
                  </div>
                )}
              </div>

              {/* 操作按钮 - 优化交互 */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="flat"
                  className="flex-1 bg-default-100/50 hover:bg-default-200/50 transition-colors group"
                  startContent={
                    <Icon 
                      icon="mdi:eye" 
                      className="w-4 h-4 group-hover:scale-110 transition-transform" 
                    />
                  }
                  onPress={() => window.open(`/app-run/${app.id}`, "_blank")}
                >
                  访问应用
                </Button>

                <Button
                  size="sm"
                  color="primary"
                  className="flex-1 bg-primary/10 hover:bg-primary/20 transition-colors group"
                  startContent={
                    <Icon 
                      icon="hugeicons:ai-chat-02" 
                      className="w-4 h-4 group-hover:scale-110 transition-transform" 
                    />
                  }
                  onPress={() => navigate(`/admin/apps/${app.id}/builder`)}
                >
                  开发应用
                </Button>

                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  className="bg-danger-50/50 hover:bg-danger-100/50 transition-colors group"
                  startContent={
                    <Icon 
                      icon="mdi:shield-lock" 
                      className="w-4 h-4 group-hover:scale-110 transition-transform" 
                    />
                  }
                  onPress={onPermissionModalOpen}
                >
                  访问控制
                </Button>

                <Dropdown>
                  <DropdownTrigger>
                    <Button 
                      size="sm" 
                      variant="light" 
                      isIconOnly 
                      className="bg-default-100/50 hover:bg-default-200/50 group"
                    >
                      <Icon 
                        icon="mdi:dots-vertical" 
                        className="w-5 h-5 group-hover:scale-110 transition-transform" 
                      />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="应用操作">
                    <DropdownItem
                      key="copy-id"
                      startContent={
                        <Icon
                          icon="mdi:content-copy"
                          className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200"
                          aria-hidden="true"
                        />
                      }
                      onPress={handleCopyId}
                    >
                      复制ID
                    </DropdownItem>
                    <DropdownItem
                      key="rename"
                      startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
                      onPress={onRenameModalOpen}
                    >
                      重命名
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Icon icon="mdi:delete" className="w-4 h-4" />}
                      onPress={handleDelete}
                    >
                      删除应用
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={onPermissionModalClose}
        resourceType="app"
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
          <ModalHeader className="flex flex-col gap-1">重命名应用</ModalHeader>
          <ModalBody>
            <Input
              label="应用名称"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              variant="bordered"
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onRenameModalClose}>
              取消
            </Button>
            <Button
              color="primary"
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