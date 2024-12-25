import React, { useState, useEffect } from "react"
import { Card, CardBody, Button, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getAccount } from "@/service/apis/pay"
import CostRecords from "./CostRecords"
import globalStore from "@/globalStore"
import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores/StoreProvider'
import { reaction } from 'mobx'
import { subscriptionService } from "@/permissions/utils/permissionUtils"
import message from "@/components/Message"

const AccountFinance = observer(() => {
  const { balanceStore } = useStore()
  const [account, setAccount] = useState(null)
  const [actualBalance, setActualBalance] = useState(balanceStore.actualBalance)
  const [subscription, setSubscription] = useState(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)

  useEffect(() => {
    fetchAccountData()
    fetchSubscriptionData()

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
    }
  }

  const handleSubscriptionAction = () => {
    // 处理购买/续费操作
    balanceStore.showRechargeModal(true)
  }

  const InfoItem = ({ label, value }) => (
    <div className='flex justify-between items-center py-2 border-b border-default-200 last:border-none'>
      <span className='text-default-600'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  )

  const getSubscriptionStatusChip = () => {
    if (!subscriptionStatus) return null

    const statusConfig = {
      active: { color: "success", label: "正常" },
      warning: { color: "warning", label: "即将到期" },
      expired: { color: "danger", label: "已过期" }
    }

    const config = statusConfig[subscriptionStatus.status]
    return <Chip color={config.color} variant="flat" size="sm">{config.label}</Chip>
  }

  return (
    <div className='grid gap-6 p-4'>
      <Card className='w-full'>
        <CardBody>
          <div className='flex items-center gap-2 mb-4'>
            <Icon icon='solar:wallet-money-bold-duotone' className='w-6 h-6 text-primary' />
            <h3 className='text-lg font-medium'>账户信息</h3>
          </div>
          <div className='flex flex-col gap-4'>
            <div>
              <InfoItem
                label='塔币余额'
                value={account?.totalComputePower ? `${(account.totalComputePower / 100).toFixed(2)} 塔币` : "0 塔币"}
              />
              <InfoItem label='实际可用余额' value={`${actualBalance.toFixed(2)} 塔币`} />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                color='primary'
                variant='flat'
                startContent={<Icon icon='solar:card-recive-bold-duotone' />}
                onClick={() => balanceStore.showRechargeModal(false)}
              >
                充值
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
                <span className='text-xl font-semibold'>
                  {subscription.type === 'personal' ? '个人版' : '企业版'}
                </span>
                {getSubscriptionStatusChip()}
              </div>
              <InfoItem 
                label='到期时间' 
                value={new Date(subscription.expireDate).toLocaleDateString()} 
              />
              <InfoItem 
                label='内部账号限制' 
                value={`${subscription.features.nbAccountLimit}个`} 
              />
              <InfoItem 
                label='Token额度' 
                value={`${subscription.features.tokenAmount.toLocaleString()}个`} 
              />
              {subscriptionStatus?.status === 'warning' && (
                <div className='text-warning text-sm mt-2'>
                  <Icon icon='solar:alarm-bold-duotone' className='inline-block mr-1' />
                  {subscriptionStatus.message}
                </div>
              )}
              <Button 
                color='primary' 
                variant='flat' 
                startContent={<Icon icon='solar:card-recive-bold-duotone' />}
                onClick={handleSubscriptionAction}
                className='w-full'
              >
                续费套餐
              </Button>
            </div>
          ) : (
            <div className='text-center py-6'>
              <Icon 
                icon='solar:shield-warning-bold-duotone' 
                className='w-12 h-12 text-warning mb-4' 
              />
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

      <CostRecords onTotalCostChange={handleTotalCostChange} />
    </div>
  )
})

export default AccountFinance