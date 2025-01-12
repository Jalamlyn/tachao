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
  Radio,
  RadioGroup,
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
import { queryMyProject, addProjectMember } from "@/service/apis/project"
import { subscriptionService } from "@/app/admin/src/permissions/utils/permissionUtils"
import message from "@/components/Message"
import { useStore } from "@/stores/StoreProvider"
import globalStore from "@/globalStore"
import { useGlobalUser } from "@/hooks/useGlobalUser"

// 添加账号格式验证函数
const validateAccount = (account: string): { isValid: boolean; message?: string } => {
  // 英文字母开头，后面可以是字母、数字或下划线
  const accountRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/

  if (!account) {
    return { isValid: false, message: "账号不能为空" }
  }

  if (!accountRegex.test(account)) {
    return {
      isValid: false,
      message: "账号必须以英文字母开头，只能包含英文字母、数字和下划线",
    }
  }

  return { isValid: true }
}

const AccountManagement: React.FC = () => {
  const { balanceStore } = useStore()
  const [accounts, setAccounts] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountDetail, setAccountDetail] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()
  const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure()
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure()
  const { updateBreadcrumbs } = useBreadcrumb()
  // 添加账号验证状态
  const [accountError, setAccountError] = useState("")
  const userInfo = useGlobalUser()

  useEffect(() => {
    fetchAccounts()
    fetchRoles()
    fetchSubscription()

    // 更新面包屑
    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "企业设置", href: "/admin/settings" },
    ])
  }, [])

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionService.getSubscription(globalStore.organizationId)
      setSubscription(data)
    } catch (error) {
      console.error("Failed to fetch subscription", error)
    }
  }

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
      // 验证账号格式
      const accountValidation = validateAccount(values.account)
      if (!accountValidation.isValid) {
        message.error(accountValidation.message)
        return
      }

      // 检查账号类型和限制
      if (values.type === "nb") {
        if (!subscription || subscription.type === "personal") {
          message.error("个人版不能创建内部账号，请升级到企业版")
          return
        }

        const nbAccounts = accounts.filter((acc) => acc.name.startsWith("nb_"))
        if (nbAccounts.length >= subscription.features.nbAccountLimit) {
          debugger
          message.error(`已达到内部账号数量限制(${subscription.features.nbAccountLimit}个)`)
          return
        }
      }

      // 设置账号名称前缀
      const accountName = values.type === "nb" ? `nb_${values.name}` : `wb_${values.name}`

      // 创建账号
      const accountRes = await createRamAccount({
        ...values,
        name: accountName,
      })

      // 查询默认企业项目
      const projectRes = await queryMyProject({ name: "默认企业项目" })
      if (projectRes.data && projectRes.data.length > 0) {
        // 将新账号添加到默认项目中
        await addProjectMember({
          projectId: projectRes.data[0].id,
          ramUserId: accountRes.id,
          role: "PROJECT_MANAGER", // 默认角色
          name: accountRes.name,
        })
      }

      // 更新账号使用记录
      await subscriptionService.updateAccountUsage(globalStore.organizationId, {
        organizationId: globalStore.organizationId,
        accounts: [
          ...accounts,
          {
            accountId: accountRes.id,
            name: accountName,
            type: values.type,
            createdAt: new Date().toISOString(),
          },
        ],
      })

      onCreateModalClose()
      fetchAccounts()
      message.success("账号创建成功")
    } catch (error) {
      console.error("Failed to create account or add to project", error)
      message.error("创建账号失败")
    }
  }

  const handleEditAccount = async (values) => {
    try {
      // 验证账号格式
      const accountValidation = validateAccount(values.account)
      if (!accountValidation.isValid) {
        message.error(accountValidation.message)
        return
      }

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

  const getAccountTypeChip = (name: string) => {
    if (name === "管理员") {
      return (
        <Chip color='primary' variant='flat'>
          管理员
        </Chip>
      )
    }
    if (name.startsWith("nb_")) {
      return (
        <Chip color='secondary' variant='flat'>
          内部账号
        </Chip>
      )
    }
    if (name.startsWith("wb_")) {
      return <Chip variant='flat'>外部账号</Chip>
    }
    return null
  }

  const handleAccountChange = (value: string) => {
    const validation = validateAccount(value)
    if (!validation.isValid) {
      setAccountError(validation.message)
    } else {
      setAccountError("")
    }
  }

  const columns = [
    { name: "名称", uid: "name" },
    { name: "账号", uid: "account" },
    { name: "类型", uid: "type" },
    { name: "操作", uid: "actions" },
  ]

  const renderCell = (account, columnKey) => {
    switch (columnKey) {
      case "type":
        return getAccountTypeChip(account.name)
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
            {/* <Tooltip content='分配角色'>
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
            </Tooltip> */}
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
                <RadioGroup label='账号类型' name='type' orientation='horizontal' defaultValue='wb'>
                  <Radio value='nb'>
                    内部账号
                    <span className='text-tiny text-default-400 ml-1'>(企业员工)</span>
                  </Radio>
                  <Radio value='wb'>
                    外部账号
                    <span className='text-tiny text-default-400 ml-1'>(供应商/客户)</span>
                  </Radio>
                </RadioGroup>
                <Input name='name' label='名称' required />
                <Input
                  name='account'
                  label='账号'
                  required
                  onValueChange={handleAccountChange}
                  errorMessage={accountError}
                  description='账号必须以英文字母开头，只能包含英文字母、数字和下划线'
                />
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
                <Input
                  name='account'
                  label='账号'
                  defaultValue={selectedAccount?.account}
                  required
                  onValueChange={handleAccountChange}
                  errorMessage={accountError}
                  description='账号必须以英文字母开头，只能包含英文字母、数字和下划线'
                />
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
