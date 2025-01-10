import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Spinner,
  RadioGroup,
  Radio,
} from "@nextui-org/react"
import { usePermissions } from "../hooks/usePermissions"
import { Permission, ResourceType } from "../types"
import { queryRamAccount } from "@/service/apis/user"
import message from "@/components/Message"
import { setResourceAccessControl } from "../utils/permissionUtils"
import { Icon } from "@iconify/react"

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
  const [accessMode, setAccessMode] = useState<"public" | "authenticated" | "specified">("public")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadPermissions()
      loadAccounts()
    }
  }, [isOpen])

  useEffect(() => {
    if (permissions) {
      // 根据现有权限设置初始访问模式
      if (permissions.isPublic) {
        setAccessMode("public")
      } else if (permissions.requireAuth) {
        setAccessMode("authenticated")
      } else {
        setAccessMode("specified")
      }
      setHasUnsavedChanges(false)
    }
  }, [permissions])

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
  }

  const handleAddPermission = async () => {
    if (!newAccountId.trim()) {
      message.error("请选择账号")
      return
    }

    try {
      await grantPermission(resourceId, newAccountId, "access")
      await loadPermissions()
      setNewAccountId("")
      message.success("添加用户成功")
    } catch (error) {
      message.error("添加用户失败")
    }
  }

  const handleRemovePermission = async (accountId: string) => {
    try {
      await revokePermission(resourceId, accountId)
      await loadPermissions()
      message.success("移除用户成功")
    } catch (error) {
      message.error("移除用户失败")
    }
  }

  const handleAccessModeChange = (value: string) => {
    setAccessMode(value as "public" | "authenticated" | "specified")
    setHasUnsavedChanges(true)
  }

  const handleSaveSettings = async () => {
    try {
      const accessControl = {
        isPublic: accessMode === "public",
        requireAuth: accessMode === "authenticated",
      }

      await setResourceAccessControl(resourceType, resourceId, accessControl)

      // 如果切换到其他模式，清除所有特定用户权限
      if (accessMode !== "specified") {
        const currentPermissions = permissions?.accounts || []
        for (const account of currentPermissions) {
          await revokePermission(resourceId, account.accountId)
        }
      }

      await loadPermissions()
      setHasUnsavedChanges(false)
      message.success("访问控制设置已更新")
    } catch (error) {
      console.error("Error updating access mode:", error)
      message.error("更新访问控制失败")
    }
  }

  const availableAccounts = accounts.filter(
    (account) => !permissions?.accounts.some((perm) => perm.accountId === account.id)
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <Icon icon='mdi:shield-lock' className='w-5 h-5' />
                <span>访问控制设置 - {resourceTitle}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className='space-y-4'>
                <RadioGroup
                  label='选择访问控制方式'
                  value={accessMode}
                  onValueChange={handleAccessModeChange}
                  description='设置谁可以访问此应用'
                >
                  <Radio value='public'>
                    <div className='flex flex-col'>
                      <span className='text-small font-medium'>所有用户可访问</span>
                      <span className='text-tiny text-default-400'>任何人都可以访问此应用</span>
                    </div>
                  </Radio>
                  <Radio value='authenticated'>
                    <div className='flex flex-col'>
                      <span className='text-small font-medium'>所有登录用户可访问</span>
                      <span className='text-tiny text-default-400'>需要登录后才能访问此应用</span>
                    </div>
                  </Radio>
                  <Radio value='specified'>
                    <div className='flex flex-col'>
                      <span className='text-small font-medium'>指定用户访问</span>
                      <span className='text-tiny text-default-400'>仅允许特定用户访问此应用</span>
                    </div>
                  </Radio>
                </RadioGroup>

                {accessMode === "specified" && (
                  <>
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
                        isDisabled={isLoadingAccounts || !newAccountId}
                      >
                        添加
                      </Button>
                    </div>

                    <div className='space-y-2'>
                      <div className='text-small font-medium'>已授权用户列表：</div>
                      {permissions?.accounts.map((account) => (
                        <div
                          key={account.accountId}
                          className='flex items-center justify-between p-2 rounded-lg border border-default-200'
                        >
                          <div className='flex items-center gap-2'>
                            <Icon icon='mdi:account' className='text-default-500' />
                            <span>{accounts.find((a) => a.id === account.accountId)?.name || account.accountId}</span>
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
                        <div className='text-center text-default-500 py-4'>暂无授权用户</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                关闭
              </Button>
              <Button
                color='primary'
                onPress={handleSaveSettings}
                startContent={<Icon icon='mdi:content-save' className='w-4 h-4' />}
                isDisabled={!hasUnsavedChanges}
              >
                保存设置
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
