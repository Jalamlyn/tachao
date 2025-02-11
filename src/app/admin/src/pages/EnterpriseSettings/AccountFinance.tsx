import React, { useState, useEffect } from "react"
import { Card, CardBody, Button, Chip, Spinner, Tooltip, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getAccount } from "@/service/apis/pay"
import CostRecords from "./CostRecords"
import globalStore from "@/globalStore"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { reaction } from "mobx"
import { subscriptionService } from "@/app/admin/src/permissions/utils/permissionUtils"
import message from "@/components/Message"
import { getMetadata } from "@/service/apis/metadata"

const AccountFinance = observer(() => {
  const { balanceStore } = useStore()
  const [account, setAccount] = useState(null)
  const [actualBalance, setActualBalance] = useState(balanceStore.actualBalance)
  const [subscription, setSubscription] = useState(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [totalCost, setTotalCost] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [balanceLogs, setBalanceLogs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const costRecordsRef = React.useRef(null)

  useEffect(() => {
    fetchAccountData()
    fetchSubscriptionData()
    fetchBalanceLogs()
    balanceStore.fetchBalance()
    // 监听余额变化
    const disposer = reaction(
      () => balanceStore.actualBalance,
      (newBalance) => {
        setActualBalance(newBalance)
        globalStore.actualBalance = newBalance
      }
    )

    return () => disposer()
  }, [])

  const fetchBalanceLogs = async () => {
    try {
      const logs = await getMetadata(["balance-logs"])
      const parsedLogs = logs?.data[0]?.value ? JSON.parse(logs.data[0].value) : []
      setBalanceLogs(parsedLogs)
    } catch (error) {
      console.error("Error fetching balance logs:", error)
    }
  }

  const fetchAccountData = async () => {
    try {
      const accountRes = await getAccount()
      setAccount(accountRes)
    } catch (error) {
      console.error("Error fetching account data:", error)
    }
  }

  const fetchSubscriptionData = async () => {
    try {
      const subscriptionData = await subscriptionService.getSubscription(globalStore.organizationId)
      setSubscription(subscriptionData)
      if (subscriptionData) {
        const status = await subscriptionService.checkSubscriptionStatus(globalStore.organizationId)
        setSubscriptionStatus(status)
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    const loadingId = message.loading("正在刷新数据...")

    try {
      await Promise.all([
        fetchAccountData(),
        fetchSubscriptionData(),
        fetchBalanceLogs(),
        costRecordsRef.current?.refresh(),
      ])
      message.closeLoading(loadingId, "success", "数据刷新成功")
    } catch (error) {
      console.error("Error refreshing data:", error)
      message.closeLoading(loadingId, "error", "数据刷新失败")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSubscriptionAction = () => {
    balanceStore.showRechargeModal(false)
  }

  const handleTotalCostChange = (cost: number) => {
    setTotalCost(cost)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const InfoItem = ({ label, value, tooltip = null }) => (
    <div className='flex justify-between items-center py-2 border-b border-default-200 last:border-none'>
      <span className='text-default-600'>{label}</span>
      {tooltip ? (
        <Tooltip content={tooltip}>
          <div className='flex items-center gap-2'>
            {parseFloat(value) < 0 && (
              <Chip color='danger' size='sm' variant='flat'>
                欠费
              </Chip>
            )}
            <span className={`font-medium cursor-help ${parseFloat(value) < 0 ? "text-danger" : ""}`}>{value}</span>
          </div>
        </Tooltip>
      ) : (
        <span className='font-medium'>{value}</span>
      )}
    </div>
  )

  const getSubscriptionStatusChip = () => {
    if (!subscriptionStatus) return null

    const statusConfig = {
      active: { color: "success", label: "正常" },
      warning: { color: "warning", label: "即将到期" },
      expired: { color: "danger", label: "已过期" },
    }

    const config = statusConfig[subscriptionStatus.status]
    return (
      <Chip color={config.color} variant='flat' size='sm'>
        {config.label}
      </Chip>
    )
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-300px)]'>
        <Spinner size='lg' label='加载中...' />
      </div>
    )
  }

  return (
    <div className='grid gap-6 p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>账户费用</h2>
        <Tooltip content='刷新数据'>
          <Button isIconOnly variant='light' onPress={handleRefresh} isLoading={isRefreshing}>
            <Icon icon='solar:refresh-circle-bold-duotone' className='w-6 h-6 text-default-600' />
          </Button>
        </Tooltip>
      </div>

      <Card className='w-full'>
        <CardBody>
          <div className='flex items-center gap-2 mb-4'>
            <Icon icon='solar:wallet-money-bold-duotone' className='w-6 h-6 text-primary' />
            <h3 className='text-lg font-medium'>账户信息</h3>
          </div>
          <div className='flex flex-col gap-4'>
            <div>
              <InfoItem
                label='累计充值梦想币总额'
                value={account?.totalComputePower ? `${(account.totalComputePower / 100).toFixed(2)} 梦想币` : "0 梦想币"}
                tooltip='账户充值的总梦想币数量'
              />
              <InfoItem label='已消费' value={`${totalCost.toFixed(2)} 梦想币`} tooltip='所有已使用的梦想币总和' />
              <InfoItem
                label='实际可用余额'
                value={`${actualBalance.toFixed(2)} 梦想币`}
                tooltip='总额减去已消费后的实际可用余额'
              />
              {actualBalance < 0 && (
                <div className='mt-2 p-2 bg-danger-50 rounded-lg'>
                  <p className='text-sm text-danger flex items-center gap-1'>
                    <Icon icon='solar:danger-triangle-bold-duotone' className='w-4 h-4' />
                    <span>当前账户已欠费 {Math.abs(actualBalance).toFixed(2)} 梦想币， 请及时为梦想充值</span>
                  </p>
                </div>
              )}
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                color='primary'
                variant='flat'
                startContent={<Icon icon='solar:card-recive-bold-duotone' />}
                onClick={() => balanceStore.showRechargeModal(false)}
              >
                {actualBalance < 0 ? "立即充值补缴" : "充值购买套餐"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className='w-full'>
        <CardBody>
          <div className='flex items-center gap-2 mb-4'>
            <Icon icon='solar:shield-star-bold-duotone' className='w-6 h-6 text-primary' />
            <h3 className='text-lg font-medium'>套餐信息</h3>
          </div>
          {subscription ? (
            <div className='space-y-4'>
              <div className='flex justify-between items-center mb-4'>
                <span className='text-xl font-semibold'>{subscription.type === "personal" ? "个人版" : "企业版"}</span>
                {getSubscriptionStatusChip()}
              </div>
              <InfoItem label='到期时间' value={new Date(subscription.expireDate).toLocaleDateString()} />
              <InfoItem label='内部账号限制' value={`${subscription.features.nbAccountLimit}个`} />
              {subscriptionStatus?.status === "warning" && (
                <div className='text-warning text-sm mt-2'>
                  <Icon icon='solar:alarm-bold-duotone' className='inline-block mr-1' />
                  {subscriptionStatus.message}
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-6'>
              <p className='text-lg mb-4'>您当前没有激活的套餐</p>
              <p className='text-default-500 mb-6'>
                购买套餐以使用更多功能，包括：
                <ul className='text-left list-disc list-inside mt-2'>
                  <li>创建更多内部账号</li>
                  <li>更多Token使用额度</li>
                  <li>高级功能访问权限</li>
                </ul>
              </p>
              <Button
                color='primary'
                startContent={<Icon icon='solar:shield-star-bold-duotone' />}
                onClick={handleSubscriptionAction}
                className='w-full'
              >
                购买套餐
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <Input
            size='sm'
            placeholder='搜索用户名...'
            value={searchQuery}
            onValueChange={handleSearchChange}
            startContent={<Icon icon='solar:minimalistic-magnifer-bold-duotone' className='text-default-400' />}
            className='w-64'
          />
        </div>
        <CostRecords ref={costRecordsRef} onTotalCostChange={handleTotalCostChange} searchQuery={searchQuery} />
      </div>
    </div>
  )
})

export default AccountFinance
