import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Button, Tooltip, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/stores/StoreProvider"

const BalanceDisplay = observer(() => {
  const { balanceStore } = useStore()

  useEffect(() => {
    // 初始加载余额
    balanceStore.fetchBalance()

    // 设置定期更新
    const timer = setInterval(
      () => {
        balanceStore.fetchBalance()
      },
      2 * 60 * 1000
    ) // 每1分钟更新一次

    return () => clearInterval(timer)
  }, [])

  return (
    <div className='flex items-center gap-2'>
      <Tooltip content='点击充值'>
        <Button
          size='sm'
          variant='light'
          color={balanceStore.actualBalance < 10 ? "warning" : "primary"}
          startContent={<Icon icon='solar:wallet-money-bold' className='w-4 h-4' />}
          onClick={() => balanceStore.showRechargeModal(false)}
        >
          <AnimatePresence mode='wait'>
            <motion.span
              key={balanceStore.actualBalance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='font-medium'
            >
              {balanceStore.actualBalance.toFixed(2)} 梦想币
            </motion.span>
          </AnimatePresence>
        </Button>
      </Tooltip>
    </div>
  )
})

export default BalanceDisplay
