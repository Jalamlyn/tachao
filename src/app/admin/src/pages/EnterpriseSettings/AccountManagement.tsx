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
import { PlusIcon, EditIcon, DeleteIcon, UserPlusIcon, EyeIcon, CopyIcon, CheckIcon } from "lucide-react"
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
import { getMetadata, setMetadata } from "@/service/apis/metadata"

interface AccountBalance {
  limit: number
  used: number
}

interface AccountBalances {
  [accountId: string]: AccountBalance
}

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

// 添加手机号验证函数
const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  const phoneRegex = /^1[3-9]\d{9}$/

  if (!phone) {
    return { isValid: false, message: "手机号不能为空" }
  }

  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      message: "请输入正确的11位手机号",
    }
  }

  return { isValid: true }
}

// 验证塔币限制输入
const validateBalanceLimit = (limit: string): { isValid: boolean; message?: string } => {
  const number = Number(limit)
  if (isNaN(number)) {
    return { isValid: false, message: "请输入有效的数字" }
  }
  if (number < 0) {
    return { isValid: false, message: "塔币限制不能为负数" }
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
  const [copyingAccountId, setCopyingAccountId] = useState(null)
  const [phoneError, setPhoneError] = useState("")
  const [accountError, setAccountError] = useState("")
  const [accountBalances, setAccountBalances] = useState<AccountBalances>({})
  const [balanceLimitError, setBalanceLimitError] = useState("")
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()
  const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure()
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure()
  const { updateBreadcrumbs } = useBreadcrumb()
  const { userInfo, loading } = useGlobalUser()

  useEffect(() => {
    fetchAccounts()
    fetchRoles()
    fetchSubscription()
    fetchAccountBalances()

    updateBreadcrumbs([
      { label: "首页", href: "/admin" },
      { label: "企业设置", href: "/admin/settings" },
    ])
  }, [])

  const fetchAccountBalances = async () => {
    try {
      const res = await getMetadata(["account-balances"])
      if (res?.data?.[0]?.value) {
        setAccountBalances(JSON.parse(res.data[0].value))
      }
    } catch (error) {
      console.error("Failed to fetch account balances:", error)
    }
  }

  const saveAccountBalances = async (newBalances: AccountBalances) => {
    try {
      await setMetadata(["account-balances"], newBalances)
    } catch (error) {
      console.error("Failed to save account balances:", error)
      throw error
    }
  }

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
      const accountValidation = validateAccount(values.account)
      if (!accountValidation.isValid) {
        message.error(accountValidation.message)
        return
      }

      const phoneValidation = validatePhone(values.phone)
      if (!phoneValidation.isValid) {
        message.error(phoneValidation.message)
        return
      }

      const balanceLimitValidation = validateBalanceLimit(values.balanceLimit)
      if (!balanceLimitValidation.isValid) {
        message.error(balanceLimitValidation.message)
        return
      }

      if (values.type === "nb") {
        if (!subscription || subscription.type === "personal") {
          message.error("个人版不能创建内部账号，请升级到企业版")
          return
        }

        const nbAccounts = accounts.filter((acc) => acc.name.startsWith("nb_"))
        if (nbAccounts.length >= subscription.features.nbAccountLimit) {
          if (userInfo?.organizationId !== "1") {
            message.error(`已达到内部账号数量限制(${subscription.features.nbAccountLimit}个)`)
            return
          }
        }
      }

      const accountName = values.type === "nb" ? `nb_${values.name}` : `wb_${values.name}`

      const accountRes = await createRamAccount({
        ...values,
        name: accountName,
      })

      // 设置账号塔币额度
      const newBalances = {
        ...accountBalances,
        [accountRes.id]: {
          limit: Number(values.balanceLimit) || 10,
          used: 0,
        },
      }
      await saveAccountBalances(newBalances)
      setAccountBalances(newBalances)

      const projectRes = await queryMyProject({ name: "默认企业项目" })
      if (projectRes.data && projectRes.data.length > 0) {
        await addProjectMember({
          projectId: projectRes.data[0].id,
          ramUserId: accountRes.id,
          role: "PROJECT_MANAGER",
          name: accountRes.name,
        })
      }

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
      console.error("Failed to create account", error)
      message.error("创建账号失败")
    }
  }

  const handleEditAccount = async (values) => {
    try {
      const accountValidation = validateAccount(values.account)
      if (!accountValidation.isValid) {
        message.error(accountValidation.message)
        return
      }

      const phoneValidation = validatePhone(values.phone)
      if (!phoneValidation.isValid) {
        message.error(phoneValidation.message)
        return
      }

      const balanceLimitValidation = validateBalanceLimit(values.balanceLimit)
      if (!balanceLimitValidation.isValid) {
        message.error(balanceLimitValidation.message)
        return
      }

      await updateRamAccount(selectedAccount.id, {
        ...values,
        phone: values.phone,
      })

      // 更新账号塔币额度
      const newBalances = {
        ...accountBalances,
        [selectedAccount.id]: {
          ...accountBalances[selectedAccount.id],
          limit: Number(values.balanceLimit),
        },
      }
      await saveAccountBalances(newBalances)
      setAccountBalances(newBalances)

      onEditModalClose()
      fetchAccounts()
      message.success("账号更新成功")
    } catch (error) {
      console.error("Failed to edit account", error)
      message.error("更新账号失败")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteRamAccount(selectedAccount.id)

      // 删除账号塔币额度信息
      const newBalances = { ...accountBalances }
      delete newBalances[selectedAccount.id]
      await saveAccountBalances(newBalances)
      setAccountBalances(newBalances)

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

  const copyAccountMessage = async (account) => {
    setCopyingAccountId(account.id)
    const message = `🎉 欢迎加入即想AI！

您的账号信息如下：
👤 账号：${account.account}
🔑 密码：${account.account}
🌐 登录地址：https://www.mobenai.com.cn/login?oid=1

✨ 即想AI是一个革命性的AI编程平台，让人人都能成为开发者。
💡 在这里，您可以轻松地将想法转化为应用程序，享受AI驱动的开发体验。

🚀 立即登录，开启您的AI编程之旅！

❓ 如有任何问题，请随时联系管理员。`

    try {
      await navigator.clipboard.writeText(message)
      message.success("开通消息已复制到剪贴板")
      setTimeout(() => {
        setCopyingAccountId(null)
      }, 1500)
    } catch (error) {
      console.error("Failed to copy message", error)
      message.error("复制失败，请重试")
      setCopyingAccountId(null)
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

  const handlePhoneChange = (value: string) => {
    const validation = validatePhone(value)
    if (!validation.isValid) {
      setPhoneError(validation.message)
    } else {
      setPhoneError("")
    }
  }

  const handleBalanceLimitChange = (value: string) => {
    const validation = validateBalanceLimit(value)
    if (!validation.isValid) {
      setBalanceLimitError(validation.message)
    } else {
      setBalanceLimitError("")
    }
  }

  const columns = [
    { name: "名称", uid: "name" },
    { name: "账号", uid: "account" },
    { name: "手机号", uid: "phone" },
    { name: "塔币限制", uid: "balance" },
    { name: "类型", uid: "type" },
    { name: "操作", uid: "actions" },
  ]

  const renderCell = (account, columnKey) => {
    switch (columnKey) {
      case "type":
        return getAccountTypeChip(account.name)
      case "phone":
        return account.phone || "-"
      case "balance":
        const balance = accountBalances[account.id] || { limit: 10, used: 0 }
        return (
          <Tooltip content={`已使用: ${balance.used.toFixed(2)} / 总额度: ${balance.limit}`}>
            <span>剩余: {(balance.limit - balance.used).toFixed(2)} 塔币</span>
          </Tooltip>
        )
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
            {account.name.startsWith("nb_") && (
              <Tooltip content='复制开通消息'>
                <Button isIconOnly size='sm' variant='light' onPress={() => copyAccountMessage(account)}>
                  {copyingAccountId === account.id ? (
                    <CheckIcon size={16} className='text-success' />
                  ) : (
                    <CopyIcon size={16} />
                  )}
                </Button>
              </Tooltip>
            )}
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
        aria-label='账号列表'
        isHeaderSticky
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
                <Input
                  name='phone'
                  label='手机号'
                  required
                  onValueChange={handlePhoneChange}
                  errorMessage={phoneError}
                  description='请输入11位手机号'
                />
                <Input
                  name='balanceLimit'
                  label='塔币限制'
                  type='number'
                  defaultValue='10'
                  description='默认10塔币，0表示无限制'
                  onValueChange={handleBalanceLimitChange}
                  errorMessage={balanceLimitError}
                />
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
                <Input
                  name='phone'
                  label='手机号'
                  defaultValue={selectedAccount?.phone}
                  required
                  onValueChange={handlePhoneChange}
                  errorMessage={phoneError}
                  description='请输入11位手机号'
                />
                <Input
                  name='balanceLimit'
                  label='塔币限制'
                  type='number'
                  defaultValue={accountBalances[selectedAccount?.id]?.limit || 10}
                  description='默认10塔币，0表示无限制'
                  onValueChange={handleBalanceLimitChange}
                  errorMessage={balanceLimitError}
                />
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
                      <p className='text-sm text-gray-500'>手机号</p>
                      <p>{accountDetail.phone || "-"}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>塔币限制</p>
                      <p>
                        {accountBalances[accountDetail.id]?.limit === 0
                          ? "无限制"
                          : `${accountBalances[accountDetail.id]?.limit || 10} 塔币 (已使用: ${accountBalances[accountDetail.id]?.used.toFixed(2) || 0})`}
                      </p>
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
