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
    const timer = setInterval(() => {
      balanceStore.fetchBalance()
    }, 5 * 60 * 1000) // 每5分钟更新一次

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Tooltip content="点击充值">
        <Button
          size="sm"
          variant="light"
          color={balanceStore.actualBalance < 10 ? "warning" : "primary"}
          startContent={<Icon icon="solar:wallet-money-bold" className="w-4 h-4" />}
          onClick={() => balanceStore.showRechargeModal(false)}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={balanceStore.actualBalance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-medium"
            >
              {balanceStore.actualBalance.toFixed(2)} 梦想币
            </motion.span>
          </AnimatePresence>
        </Button>
      </Tooltip>
      
      {balanceStore.actualBalance < 10 && balanceStore.actualBalance >= 0 && (
        <Chip 
          color="warning" 
          variant="flat" 
          size="sm"
          startContent={<Icon icon="solar:danger-triangle-bold" className="w-3 h-3" />}
        >
          余额偏低
        </Chip>
      )}
      
      {balanceStore.actualBalance < 0 && (
        <Chip 
          color="danger" 
          variant="flat" 
          size="sm"
          startContent={<Icon icon="solar:shield-warning-bold" className="w-3 h-3" />}
        >
          账户已欠费
        </Chip>
      )}
    </div>
  )
})

export default BalanceDisplay