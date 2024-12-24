import React, { useEffect, useState } from "react"
import { Card, CardBody, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { getAccount } from "@/service/apis/pay"
import CostRecords from "./CostRecords"
import globalStore from "@/globalStore"
import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores/StoreProvider'

const AccountFinance = observer(() => {
  const { balanceStore } = useStore()
  const [account, setAccount] = useState(null)
  const [totalCost, setTotalCost] = useState(0)
  const [actualBalance, setActualBalance] = useState(0)

  useEffect(() => {
    fetchAccountData()
  }, [])

  // 更新实际余额到 globalStore 和 balanceStore
  useEffect(() => {
    if (account?.totalComputePower) {
      const actualBalance = account.totalComputePower / 100 - totalCost
      globalStore.actualBalance = actualBalance
      balanceStore.setActualBalance(actualBalance)
      setActualBalance(actualBalance)
    }
  }, [account, totalCost])

  const fetchAccountData = async () => {
    try {
      const accountRes = await getAccount()
      setAccount(accountRes)
    } catch (error) {
      console.error("Error fetching account data:", error)
    }
  }

  const handleTotalCostChange = (cost) => {
    setTotalCost(cost)
  }

  const InfoItem = ({ label, value }) => (
    <div className='flex justify-between items-center py-2 border-b border-default-200 last:border-none'>
      <span className='text-default-600'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  )

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
                onClick={() => balanceStore.showRechargeModal()}
              >
                充值
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <CostRecords onTotalCostChange={handleTotalCostChange} />
    </div>
  )
})

export default AccountFinance