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
  Chip,
} from "@nextui-org/react"
import { usePermissions } from "../hooks/usePermissions"
import { Permission, ResourceType } from "../types"
import { queryRamAccount } from "@/service/apis/user"
import message from "@/components/Message"
import { setResourceAccessControl, isAdmin } from "../utils/permissionUtils"
import { Icon } from "@iconify/react"
import { useAppStore } from "@/app/admin/src/pages/AppManagement/store/useAppStore"

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
  const [accessMode, setAccessMode] = useState<"public" | "authenticated" | "specified">("specified")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { useApps } = useAppStore()
  const { apps } = useApps()

  useEffect(() => {
    if (isOpen) {
      loadPermissions()
      loadAccounts()
    }
  }, [isOpen])

  useEffect(() => {
    if (permissions) {
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
    if (data.isPublic) {
      setAccessMode("public")
    } else if (data.requireAuth) {
      setAccessMode("authenticated")
    } else {
      setAccessMode("specified")
    }
  }

  const getAvailableAccounts = () => {
    if (!accounts || !permissions) return []
    
    // 获取当前应用信息以识别创建者
    const appInfo = apps.find(app => app.id === resourceId)
    const creatorId = appInfo?.creator?.id

    return accounts.filter(account => {
      // 过滤掉管理员账号
      if (account.name === '管理员' || account.account === 'admin') {
        return false
      }

      // 过滤掉创建者账号
      if (account.id === creatorId) {
        return false
      }

      // 过滤掉已经有权限的账号
      return !permissions.accounts.some(perm => perm.accountId === account.id)
    })
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
    // 检查是否是永久权限用户
    const isPermanentUser = permissions?.accounts.find(
      acc => acc.accountId === accountId && acc.permanent
    )

    if (isPermanentUser) {
      message.error("无法移除管理员或创建者权限")
      return
    }

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
      await loadPermissions()
      setHasUnsavedChanges(false)
      message.success("访问控制设置已更新")
    } catch (error) {
      console.error("Error updating access mode:", error)
      message.error("更新访问控制失败")
    }
  }

  const renderAccountList = () => {
    if (!permissions?.accounts || permissions.accounts.length === 0) {
      return <div className='text-center text-default-500 py-4'>暂无授权用户</div>
    }

    // 分类显示权限
    const permanentAccounts = permissions.accounts.filter(acc => acc.permanent)
    const regularAccounts = permissions.accounts.filter(acc => !acc.permanent)

    return (
      <div className='space-y-4'>
        {/* 基础权限用户 */}
        <div className='space-y-2'>
          <div className='text-small font-medium'>基础权限用户</div>
          {permanentAccounts.map((account) => (
            <div
              key={account.accountId}
              className='flex items-center justify-between p-2 rounded-lg border border-default-200 bg-default-50'
            >
              <div className='flex items-center gap-2'>
                <Icon icon='mdi:account' className='text-default-500' />
                <span>{accounts.find((a) => a.id === account.accountId)?.name || account.accountId}</span>
                <Chip 
                  size='sm' 
                  color={account.isCreator ? 'primary' : 'secondary'}
                >
                  {account.isCreator ? '创建者' : '管理员'}
                </Chip>
              </div>
            </div>
          ))}
        </div>

        {/* 其他授权用户 */}
        {regularAccounts.length > 0 && (
          <div className='space-y-2'>
            <div className='text-small font-medium'>授权用户列表</div>
            {regularAccounts.map((account) => (
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
          </div>
        )}
      </div>
    )
  }

  const renderUserSelection = () => {
    const availableAccounts = getAvailableAccounts()

    if (availableAccounts.length === 0) {
      return (
        <div className='bg-default-50 p-3 rounded-lg'>
          <div className='text-small text-default-500 flex items-center gap-2'>
            <Icon icon='mdi:information' className='text-default-400' />
            <span>没有更多可添加的用户。管理员和创建者已具有永久访问权限。</span>
          </div>
        </div>
      )
    }

    return (
      <div className='flex items-center gap-2'>
        <Select
          size='sm'
          label='选择账号'
          placeholder='请选择要授权的账号'
          selectedKeys={newAccountId ? [newAccountId] : []}
          onSelectionChange={(keys) => setNewAccountId(Array.from(keys)[0] as string)}
          className='flex-1'
        >
          {availableAccounts.map((account) => (
            <SelectItem 
              key={account.id} 
              value={account.id}
              textValue={account.name || account.id}
            >
              <div className='flex items-center gap-2'>
                <span>{account.name || account.id}</span>
                {account.type && (
                  <Chip size='sm' variant='flat' color='default'>
                    {account.type === 'nb' ? '普通账号' : '工作台账号'}
                  </Chip>
                )}
              </div>
            </SelectItem>
          ))}
        </Select>
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
    )
  }

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
                    {isLoadingAccounts ? (
                      <div className='w-full flex items-center gap-2 h-12'>
                        <Spinner size='sm' />
                        <span className='text-small'>加载账号列表中...</span>
                      </div>
                    ) : (
                      renderUserSelection()
                    )}

                    <div classNameclassName='space-y-2'>
                      <div className='text-small font-medium'>已授权用户列表：</div>
                      {renderAccountList()}
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