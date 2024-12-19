import React, { useState, useEffect } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Chip,
  useDisclosure,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { usePermissions } from "../hooks/usePermissions"
import { Permission, ResourceType } from "../types"
import { queryRamAccount } from "@/service/apis/user"
import message from "@/components/Message"

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
  }

  const handleAddPermission = async () => {
    if (!newAccountId.trim()) {
      message.error("请选择账号")
      return
    }

    try {
      await grantPermission(resourceId, newAccountId, "viewer")
      await loadPermissions()
      setNewAccountId("")
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

  // 过滤掉已经有权限的账号
  const availableAccounts = accounts.filter(
    (account) => !permissions?.accounts.some((perm) => perm.accountId === account.id)
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>管理访问权限 - {resourceTitle}</ModalHeader>
            <ModalBody>
              <div className='space-y-4'>
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
                  <div className='text-small font-medium'>当前权限列表：</div>
                  {permissions?.accounts.map((account) => (
                    <div
                      key={account.accountId}
                      className='flex items-center justify-between p-2 rounded-lg border border-default-200'
                    >
                      <div className='flex items-center gap-2'>
                        <Icon icon='mdi:account' className='text-default-500' />
                        <span>{accounts.find((a) => a.id === account.accountId)?.name || account.accountId}</span>
                        <Chip size='sm' variant='flat' color='primary'>
                          {account.role}
                        </Chip>
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
