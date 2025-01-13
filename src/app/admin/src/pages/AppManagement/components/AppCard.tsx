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
  Tooltip,
  Select,
  SelectItem,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { AppIndex, useAppStore } from "../store/useAppStore"
import { PermissionModal } from "@/app/admin/src/permissions/components/PermissionModal"
import message from "@/components/Message"
import { color } from "framer-motion"
import { useCurrentUser } from "@/app/admin/src/permissions/hooks/useCurrentUser"
import { queryRamAccount } from "@/service/apis/user"

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
  const {
    isOpen: isCollaboratorModalOpen,
    onOpen: onCollaboratorModalOpen,
    onClose: onCollaboratorModalClose,
  } = useDisclosure()

  const { renameApp, isRenaming } = useRenameApp()
  const { updateAppConfig, isUpdating } = useUpdateAppConfig()
  const { user } = useCurrentUser()
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)

  // 基础编辑权限判断
  const hasEditPermission = (app: AppIndex, currentUser: any) => {
    if (!currentUser) return false
    if (currentUser.account === "admin") return true
    if (app.creator?.id === currentUser.id) return true
    return app.collaborators?.some((c) => c.id === currentUser.id) || false
  }

  // 新增：管理员权限判断（只有管理员和创建者有权限）
  const hasAdminPermission = (app: AppIndex, currentUser: any) => {
    if (!currentUser) return false
    if (currentUser.account === "admin") return true
    return app.creator?.id === currentUser.id
  }

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

  const loadAccounts = async () => {
    try {
      setIsLoadingAccounts(true)
      const response = await queryRamAccount()
      setAccounts(response.data || [])
    } catch (error) {
      console.error("Error loading accounts:", error)
      message.error("加载账号列表失败")
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const handleAddCollaborator = async () => {
    if (!selectedAccount) {
      message.error("请选择要添加的协作者")
      return
    }

    try {
      const selectedUser = accounts.find((acc) => acc.id === selectedAccount)
      if (!selectedUser) {
        throw new Error("未找到选择的用户")
      }

      const updatedCollaborators = [
        ...(app.collaborators || []),
        {
          id: selectedUser.id,
          name: selectedUser.name,
          addedAt: new Date().toISOString(),
        },
      ]

      await updateAppConfig({
        appId: app.id,
        input: {
          ...app,
          collaborators: updatedCollaborators,
        },
      })

      message.success("添加协作者成功")
      onCollaboratorModalClose()
      setSelectedAccount("")
    } catch (error) {
      console.error("Failed to add collaborator:", error)
      message.error("添加协作者失败")
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const updatedCollaborators = app.collaborators?.filter((c) => c.id !== collaboratorId) || []

      await updateAppConfig({
        appId: app.id,
        input: {
          ...app,
          collaborators: updatedCollaborators,
        },
      })

      message.success("移除协作者成功")
    } catch (error) {
      console.error("Failed to remove collaborator:", error)
      message.error("移除协作者失败")
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

  const getAvailableAccounts = () => {
    if (!accounts) return []

    const existingCollaboratorIds = app.collaborators?.map((c) => c.id) || []
    const creatorId = app.creator?.id

    return accounts.filter((account) => {
      if (existingCollaboratorIds.includes(account.id)) return false
      if (account.account === "admin") return false
      if (creatorId && account.id === creatorId) return false
      return true
    })
  }

  return (
    <>
      <Card>
        <CardBody>
          <div className='grid grid-cols-12 gap-6 items-center'>
            {/* 左侧图标区域 */}
            <div className='col-span-4 md:col-span-3'>
              <div>
                <Icon icon={getTemplateIcon(app.template)} className={`w-12 h-12 ${getTemplateColor(app.template)}`} />
              </div>
            </div>

            {/* 右侧信息区域 */}
            <div className='col-span-8 md:col-span-9 space-y-4'>
              <div className='flex justify-between items-start'>
                <div className='space-y-1'>
                  <Tooltip content={app.title}>
                    <h3 className='text-xl font-bold tracking-tight truncate max-w-36'>{app.title}</h3>
                  </Tooltip>

                  <div className='flex items-center gap-2'>
                    <Chip size='sm' variant='flat' color={getAccessControlLabel().color}>
                      {getAccessControlLabel().label}
                    </Chip>
                  </div>
                </div>

                {/* 创建者和协作者信息 */}
                <div className='flex flex-col gap-2'>
                  {app.creator && (
                    <Chip color='success' variant='bordered'>
                      <span className='tracking-tight truncate font-bold text-xs text-default-500'>
                        {app.creator.name === "管理员" ? "管理员" : app.creator.name.split("_")[1]}
                      </span>
                    </Chip>
                  )}
                  {app.collaborators && app.collaborators.length > 0 && (
                    <Tooltip
                      content={
                        <div className='p-2'>
                          <p className='text-small font-bold mb-1'>协作者:</p>
                          {app.collaborators.map((c) => (
                            <div key={c.id} className='text-tiny'>
                              {c.name}
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <Chip color='secondary' variant='bordered' className='cursor-help'>
                        <span className='tracking-tight truncate font-bold text-xs text-default-500'>
                          {app.collaborators.length} 位协作者
                        </span>
                      </Chip>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='flat'
                  startContent={<Icon icon='mdi:eye' className='w-5 h-5' />}
                  onPress={() => window.open(`/app-run/${app.id}`, "_blank")}
                ></Button>

                {hasEditPermission(app, user) && (
                  <>
                    <Button
                      size='sm'
                      color='primary'
                      startContent={<Icon icon='hugeicons:ai-chat-02' className='w-5 h-5' />}
                      onPress={() => navigate(`/admin/apps/${app.id}/builder`)}
                    ></Button>

                    <Button
                      size='sm'
                      variant='flat'
                      color='danger'
                      startContent={<Icon icon='mdi:shield-lock' className='w-5 h-5' />}
                      onPress={onPermissionModalOpen}
                    ></Button>

                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          size='sm'
                          variant='light'
                          isIconOnly
                          className='bg-default-100/50 hover:bg-default-200/50'
                        >
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
                        {/* 只有管理员和创建者可以看到这些选项 */}
                        {hasAdminPermission(app, user) && (
                          <>
                            <DropdownItem
                              key='collaborators'
                              startContent={<Icon icon='mdi:account-multiple' className='w-4 h-4' />}
                              onPress={() => {
                                loadAccounts()
                                onCollaboratorModalOpen()
                              }}
                            >
                              管理协作者
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
                          </>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardBody>
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

      <Modal
        isOpen={isCollaboratorModalOpen}
        onClose={onCollaboratorModalClose}
        size='lg'
        classNames={{
          base: "max-w-2xl",
          header: "border-b",
          body: "py-6",
          footer: "border-t",
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>管理协作者</ModalHeader>
          <ModalBody>
            <div className='space-y-6'>
              {/* 添加协作者 */}
              <div className='space-y-2'>
                <h4 className='text-base font-medium'>添加新协作者</h4>
                <div className='flex gap-2'>
                  <Select
                    label='选择用户'
                    placeholder='请选择要添加的协作者'
                    selectedKeys={selectedAccount ? [selectedAccount] : []}
                    onSelectionChange={(keys) => setSelectedAccount(Array.from(keys)[0] as string)}
                    className='flex-1'
                    isLoading={isLoadingAccounts}
                  >
                    {getAvailableAccounts().map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name || account.id}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button color='primary' onPress={handleAddCollaborator} isDisabled={!selectedAccount}>
                    添加
                  </Button>
                </div>
              </div>

              {/* 当前协作者列表 */}
              <div className='space-y-2'>
                <h4 className='text-base font-medium'>当前协作者</h4>
                {app.collaborators && app.collaborators.length > 0 ? (
                  <div className='space-y-2'>
                    {app.collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className='flex items-center justify-between p-2 rounded-lg border border-default-200'
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar
                            showFallback
                            name={collaborator.name}
                            className='w-8 h-8'
                            fallback={<Icon icon='mdi:account' className='w-4 h-4' />}
                          />
                          <div>
                            <p className='text-sm font-medium'>{collaborator.name}</p>
                            <p className='text-xs text-default-500'>
                              添加于 {new Date(collaborator.addedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size='sm'
                          color='danger'
                          variant='light'
                          isIconOnly
                          onPress={() => handleRemoveCollaborator(collaborator.id)}
                        >
                          <Icon icon='mdi:delete' className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center text-default-500 py-4'>暂无协作者</div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onCollaboratorModalClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}