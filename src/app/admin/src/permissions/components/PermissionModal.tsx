import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Select,
  SelectItem,
  Spinner,
  Checkbox,
  Switch,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { usePermissions } from "../hooks/usePermissions"
import { Permission, ResourceType, TemplatePermissionRole } from "../types"
import { queryRamAccount } from "@/service/apis/user"
import message from "@/components/Message"
import { setResourcePublicAccess } from "../utils/permissionUtils"

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  resourceType: ResourceType
  resourceId: string
  resourceTitle: string
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  resourceTitle,
}) => {
  const { getPermissions, grantPermission, revokePermission, loading } = usePermissions(resourceType)
  const [permissions, setPermissions] = useState<Permission | null>(null)
  const [newAccountId, setNewAccountId] = useState("")
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true) // 默认为公开访问

  useEffect(() => {
    if (isOpen) {
      loadPermissions()
      loadAccounts()
    }
  }, [isOpen])

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

  const loadPermissions = async () => {
    const data = await getPermissions(resourceId)
    setPermissions(data)
    // 如果没有明确设置isPublic，则默认为true
    setIsPublic(data?.isPublic !== false)
  }

  const handleAddPermission = async () => {
    if (!newAccountId.trim()) {
      message.error("请选择账号")
      return
    }

    if (selectedRoles.length === 0) {
      message.error("请选择至少一个权限")
      return
    }

    try {
      if (resourceType === "template") {
        const roles = new Set(selectedRoles)
        if (roles.has("creator")) {
          roles.add("editor")
          roles.add("viewer")
        } else if (roles.has("editor")) {
          roles.add("viewer")
        }
        await grantPermission(resourceId, newAccountId, Array.from(roles))
      } else {
        await grantPermission(resourceId, newAccountId, "viewer")
      }
      await loadPermissions()
      setNewAccountId("")
      setSelectedRoles([])
      message.success("添加权限成功")
    } catch (error) {
      message.error("添加权限失败")
    }
  }

  const handleRemovePermission = async (accountId: string) => {
    try {
      await revokePermission(resourceId, accountId)
      await loadPermissions()
      message.success("移除权限成功")
    } catch (error) {
      message.error("移除权限失败")
    }
  }

  const handlePublicAccessChange = async (isChecked: boolean) => {
    try {
      await setResourcePublicAccess(resourceType, resourceId, isChecked)
      setIsPublic(isChecked)
      await loadPermissions()
      message.success(isChecked ? "已设置为公开访问" : "已取消公开访问")
    } catch (error) {
      console.error("Error setting public access:", error)
      message.error("设置公开访问状态失败")
      setIsPublic(!isChecked)
    }
  }

  const handleRoleChange = (role: TemplatePermissionRole) => {
    setSelectedRoles((prev) => {
      const newRoles = new Set(prev)

      if (role === "creator") {
        if (newRoles.has(role)) {
          newRoles.delete(role)
        } else {
          newRoles.add(role)
          newRoles.add("editor")
          newRoles.add("viewer")
        }
      } else if (role === "editor") {
        if (!newRoles.has("creator")) {
          if (newRoles.has(role)) {
            newRoles.delete(role)
          } else {
            newRoles.add(role)
            newRoles.add("viewer")
          }
        }
      } else if (role === "viewer") {
        if (!newRoles.has("editor") && !newRoles.has("creator")) {
          if (newRoles.has(role)) {
            newRoles.delete(role)
          } else {
            newRoles.add(role)
          }
        }
      }

      return Array.from(newRoles)
    })
  }

  const availableAccounts = accounts.filter(
    (account) => !permissions?.accounts.some((perm) => perm.accountId === account.id)
  )

  const renderPermissionSelection = () => {
    if (resourceType !== "template") {
      return null
    }

    return (
      <div className='space-y-2 mt-4'>
        <div className='text-small font-medium'>选择权限：</div>
        <div className='gap-2'>
          <Checkbox isSelected={selectedRoles.includes("creator")} onValueChange={() => handleRoleChange("creator")}>
            完整权限（包含填写新表单和编辑/查看已填写表单的权限）
          </Checkbox>
          <Checkbox
            isSelected={selectedRoles.includes("editor")}
            onValueChange={() => handleRoleChange("editor")}
            isDisabled={selectedRoles.includes("creator")}
          >
            填写已有表单的权限（包含查看已有表单的权限）
          </Checkbox>
          <Checkbox
            isSelected={selectedRoles.includes("viewer")}
            onValueChange={() => handleRoleChange("viewer")}
            isDisabled={selectedRoles.includes("editor") || selectedRoles.includes("creator")}
          >
            查看权限
          </Checkbox>
        </div>
      </div>
    )
  }

  const getRoleChips = (roles: string[] | string) => {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return (
      <div className='flex gap-1'>
        {roleArray.includes("creator") && (
          <Chip size='sm' variant='flat' color='warning'>
            创建
          </Chip>
        )}
        {roleArray.includes("editor") && (
          <Chip size='sm' variant='flat' color='secondary'>
            编辑
          </Chip>
        )}
        {roleArray.includes("viewer") && (
          <Chip size='sm' variant='flat'>
            查看
          </Chip>
        )}
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>管理访问权限 - {resourceTitle}</ModalHeader>
            <ModalBody>
              <div className='space-y-4'>
                <div className='flex justify-between items-center p-3 rounded-lg border border-default-200'>
                  <div>
                    <h3 className='text-medium font-semibold'>公开访问</h3>
                    <p className='text-small text-default-500'>
                      开启后，所有登录用户都可以访问此{resourceType === "app" ? "应用" : "资源"}
                    </p>
                  </div>
                  <Switch isSelected={isPublic} onValueChange={handlePublicAccessChange} size='lg' color='success' />
                </div>

                <div className='flex items-center gap-2'>
                  {isLoadingAccounts ? (
                    <div className='w-full flex items-center gap-2 h-12'>
                      <Spinner size='sm' />
                      <span className='text-small'>加载账号列表中...</span>
                    </div>
                  ) : (
                    <Select
                      size='sm'
                      label='选择账号'
                      placeholder='请选择要授权的账号'
                      selectedKeys={newAccountId ? [newAccountId] : []}
                      onSelectionChange={(keys) => setNewAccountId(Array.from(keys)[0] as string)}
                      className='flex-1'
                    >
                      {availableAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name || account.id}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                  <Button
                    color='primary'
                    variant='light'
                    isLoading={loading}
                    onPress={handleAddPermission}
                    isDisabled={
                      isLoadingAccounts || !newAccountId || (resourceType === "template" && selectedRoles.length === 0)
                    }
                  >
                    添加
                  </Button>
                </div>

                {renderPermissionSelection()}

                <div className='space-y-2'>
                  <div className='text-small font-medium'>当前权限列表：</div>
                  {permissions?.accounts.map((account) => (
                    <div
                      key={account.accountId}
                      className='flex items-center justify-between p-2 rounded-lg border border-default-200'
                    >
                      <div className='flex items-center gap-2'>
                        <Icon icon='mdi:account' className='text-default-500' />
                        <span>{accounts.find((a) => a.id === account.accountId)?.name || account.accountId}</span>
                        {getRoleChips(account.role)}
                      </div>
                      <Button
                        size='sm'
                        color='danger'
                        variant='light'
                        isIconOnly
                        onPress={() => handleRemovePermission(account.accountId)}
                      >
                        <Icon icon='mdi:delete' />
                      </Button>
                    </div>
                  ))}
                  {(!permissions?.accounts || permissions.accounts.length === 0) && (
                    <div className='text-center text-default-500 py-4'>暂无权限记录</div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                关闭
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}