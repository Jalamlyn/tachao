// ... [之前的import语句保持不变] ...

// 添加新的接口定义
interface AccountBalance {
  limit: number;
  used: number;
}

interface AccountBalances {
  [accountId: string]: AccountBalance;
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
  // ... [之前的state定义保持不变] ...
  
  // 更新状态定义
  const [accountBalances, setAccountBalances] = useState<AccountBalances>({})
  const [balanceLimitError, setBalanceLimitError] = useState("")

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
      await setMetadata([{
        key: "account-balances",
        value: JSON.stringify(newBalances)
      }])
    } catch (error) {
      console.error("Failed to save account balances:", error)
      throw error
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

      // ... [其他验证逻辑保持不变] ...

      const accountRes = await createRamAccount({
        ...values,
        name: accountName,
      })

      // 设置账号塔币额度
      const newBalances = {
        ...accountBalances,
        [accountRes.id]: {
          limit: Number(values.balanceLimit) || 10,
          used: 0
        }
      }
      await saveAccountBalances(newBalances)
      setAccountBalances(newBalances)

      // ... [其他创建逻辑保持不变] ...

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
      // ... [验证逻辑保持不变] ...

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
          limit: Number(values.balanceLimit)
        }
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
      // ... [其他case保持不变] ...
      case "balance":
        const balance = accountBalances[account.id] || { limit: 10, used: 0 }
        return (
          <Tooltip content={`已使用: ${balance.used.toFixed(2)} / 总额度: ${balance.limit}`}>
            <span>剩余: {(balance.limit - balance.used).toFixed(2)} 塔币</span>
          </Tooltip>
        )
      // ... [其他case保持不变] ...
    }
  }

  return (
    <div>
      {/* ... [其他UI部分保持不变] ... */}
      
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalContent>
          {(onClose) => (
            <form onSubmit={...}>
              <ModalHeader className='flex flex-col gap-1'>创建账号</ModalHeader>
              <ModalBody>
                {/* ... [其他表单字段保持不变] ... */}
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
            <form onSubmit={...}>
              <ModalHeader className='flex flex-col gap-1'>编辑账号</ModalHeader>
              <ModalBody>
                {/* ... [其他表单字段保持不变] ... */}
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

      <Modal size='lg' isOpen={isDetailModalOpen} onClose={onDetailModalClose}>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>账号详情</ModalHeader>
          <ModalBody>
            {accountDetail && (
              <div className='space-y-4'>
                {/* ... [其他详情字段保持不变] ... */}
                <div>
                  <p className='text-sm text-gray-500'>塔币限制</p>
                  <p>
                    {accountBalances[accountDetail.id]?.limit === 0 
                      ? "无限制" 
                      : `${accountBalances[accountDetail.id]?.limit || 10} 塔币 (已使用: ${accountBalances[accountDetail.id]?.used.toFixed(2) || 0})`
                    }
                  </p>
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