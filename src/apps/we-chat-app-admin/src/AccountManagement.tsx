import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
  Chip,
  Tooltip,
  Spinner,
  ScrollShadow,
} from "@nextui-org/react"
import { PlusIcon, EditIcon, DeleteIcon, UserPlusIcon, EyeIcon } from "lucide-react"
import {
  queryRamAccount,
  createRamAccount,
  queryRoles,
  byRamUser,
  deleteRamAccount,
  updateRamAccount,
  queryRamAccountDetail,
} from "@/service/apis/api"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"

const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountDetail, setAccountDetail] = useState(null)
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()
  const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure()
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure()
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    fetchAccounts()
    fetchRoles()

    // 更新面包屑
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "企业设置", href: "/we-chat-app/admin/settings" },
      { label: "账号管理", href: "/we-chat-app/admin/settings#accounts" },
    ])
  }, [])

  const fetchAccounts = async () => {
    setIsLoading(true)
    try {
      const res = await queryRamAccount()
      setAccounts(res.data)
    } catch (error) {
      console.error("Failed to fetch accounts", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await queryRoles({})
      setRoles(res.data.filter((role) => role.name !== "管理员"))
    } catch (error) {
      console.error("Failed to fetch roles", error)
    }
  }

  const handleCreateAccount = async (values) => {
    try {
      await createRamAccount(values)
      onCreateModalClose()
      fetchAccounts()
    } catch (error) {
      console.error("Failed to create account", error)
    }
  }

  const handleEditAccount = async (values) => {
    try {
      await updateRamAccount(selectedAccount.id, values)
      onEditModalClose()
      fetchAccounts()
    } catch (error) {
      console.error("Failed to edit account", error)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteRamAccount(selectedAccount.id)
      onDeleteModalClose()
      fetchAccounts()
    } catch (error) {
      console.error("Failed to delete account", error)
    }
  }

  const handleAssignRole = async (roleIds) => {
    try {
      await byRamUser(selectedAccount.id, roleIds)
      onRoleModalClose()
      fetchAccounts()
    } catch (error) {
      console.error("Failed to assign role", error)
    }
  }

  const handleViewAccountDetail = async (accountId) => {
    try {
      const res = await queryRamAccountDetail(accountId)
      setAccountDetail(res)
      onDetailModalOpen()
    } catch (error) {
      console.error("Failed to fetch account detail", error)
    }
  }

  const columns = [
    { name: "名称", uid: "name" },
    { name: "账号", uid: "account" },
    { name: "操作", uid: "actions" },
  ]

  const renderCell = (account, columnKey) => {
    switch (columnKey) {
      case "actions":
        return (
          <div className='flex justify-center gap-2'>
            <Tooltip content='查看详情'>
              <Button isIconOnly size='sm' variant='light' onPress={() => handleViewAccountDetail(account.id)}>
                <EyeIcon size={16} />
              </Button>
            </Tooltip>
            <Tooltip content='编辑账号'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={() => {
                  setSelectedAccount(account)
                  onEditModalOpen()
                }}
              >
                <EditIcon size={16} />
              </Button>
            </Tooltip>
            <Tooltip content='分配角色'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={() => {
                  setSelectedAccount(account)
                  onRoleModalOpen()
                }}
              >
                <UserPlusIcon size={16} />
              </Button>
            </Tooltip>
            <Tooltip content='删除账号' color='danger'>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                color='danger'
                onPress={() => {
                  setSelectedAccount(account)
                  onDeleteModalOpen()
                }}
              >
                <DeleteIcon size={16} />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return account[columnKey]
    }
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>账号管理</h2>
        <Button color='primary' endContent={<PlusIcon />} onPress={onCreateModalOpen}>
          创建账号
        </Button>
      </div>

      <Table
        isHeaderSticky
        aria-label='账号列表'
        classNames={{
          base: "max-h-[calc(100vh-420px)] overflow-scroll",
          wrapper: "rounded-none",
          table: "min-h-[400px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody items={accounts} isLoading={isLoading} loadingContent={<Spinner label='加载中...' />}>
          {(item) => (
            <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const values = Object.fromEntries(formData.entries())
                handleCreateAccount(values)
              }}
            >
              <ModalHeader className='flex flex-col gap-1'>创建账号</ModalHeader>
              <ModalBody>
                <Input name='name' label='名称' required />
                <Input name='account' label='账号' required />
                <Input name='password' label='密码' type='password' required />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  取消
                </Button>
                <Button color='primary' type='submit'>
                  创建
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const values = Object.fromEntries(formData.entries())
                handleEditAccount(values)
              }}
            >
              <ModalHeader className='flex flex-col gap-1'>编辑账号</ModalHeader>
              <ModalBody>
                <Input name='name' label='名称' defaultValue={selectedAccount?.name} required />
                <Input name='account' label='账号' defaultValue={selectedAccount?.account} required />
                <Input name='password' label='密码' type='password' placeholder='留空则不修改密码' />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  取消
                </Button>
                <Button color='primary' type='submit'>
                  保存
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>确认删除</ModalHeader>
          <ModalBody>
            <p>您确定要删除账号 "{selectedAccount?.name}" 吗？此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button color='default' variant='light' onPress={onDeleteModalClose}>
              取消
            </Button>
            <Button color='danger' onPress={handleDeleteAccount}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose}>
        <ModalContent>
          {(onClose) => (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const roleIds = formData.getAll("roleIds")
                handleAssignRole(roleIds)
              }}
            >
              <ModalHeader className='flex flex-col gap-1'>分配角色</ModalHeader>
              <ModalBody>
                <Select
                  label='角色'
                  selectionMode='multiple'
                  name='roleIds'
                  defaultSelectedKeys={selectedAccount?.userRoles?.map((role) => role.id) || []}
                >
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  取消
                </Button>
                <Button color='primary' type='submit'>
                  保存
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal size='lg' isOpen={isDetailModalOpen} onClose={onDetailModalClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>账号详情</ModalHeader>
          <ModalBody>
            {accountDetail && (
              <div className='space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>基本信息</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-gray-500'>名称</p>
                      <p>{accountDetail.name}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>账号</p>
                      <p>{accountDetail.account}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>创建时间</p>
                      <p>{new Date(accountDetail.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>最后更新时间</p>
                      <p>{new Date(accountDetail.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>角色信息</h3>
                  <div className='flex flex-wrap gap-2'>
                    {accountDetail.userRoles?.map((role) => (
                      <Chip key={role.id} color='primary' variant='flat'>
                        {role.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onPress={onDetailModalClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default AccountManagement
