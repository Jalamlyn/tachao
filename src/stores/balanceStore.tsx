import { makeAutoObservable } from "mobx"
import globalStore from "@/globalStore"
import { message } from "@/components/Message"

class BalanceStore {
  actualBalance: number = 0
  isRechargeModalOpen: boolean = false

  constructor() {
    makeAutoObservable(this)
    this.actualBalance = globalStore.actualBalance
  }

  setActualBalance(balance: number) {
    this.actualBalance = balance
    globalStore.actualBalance = balance
  }

  showRechargeModal(showConfirm = true) {
    if (showConfirm) {
      const isNegative = this.actualBalance < 0
      message.confirm({
        title: isNegative ? "账户欠费提醒" : "余额不足提醒",
        content: (
          <div className='space-y-2'>
            <p>
              {isNegative
                ? `当前账户已欠费 ${Math.abs(this.actualBalance).toFixed(2)} 塔币`
                : "当前账户余额不足，无法继续使用。"}
            </p>
            <p>是否前往充值页面？</p>
          </div>
        ),
        onOk: () => {
          window.open("/we-chat-app/admin/settings?tab=finance", "_blank")
        },
        okText: isNegative ? "去补缴" : "去充值",
        cancelText: "取消",
      })
    } else {
      this.isRechargeModalOpen = true
    }
  }

  hideRechargeModal() {
    this.isRechargeModalOpen = false
  }

  // 同步检查余额和订阅状态
  checkBalance(): boolean {
    // 1. 检查订阅状态
    const subscription = globalStore.subscription
    if (!subscription.status || subscription.status === "expired") {
      message.confirm({
        title: subscription.status === "expired" ? "套餐已过期提醒" : "未开通套餐提醒",
        content: (
          <div className='space-y-2'>
            <p>
              {subscription.status === "expired"
                ? "您的套餐已过期，无法继续使用该功能。"
                : "您当前没有开通套餐，无法使用该功能。"}
            </p>
            <p>是否前往{subscription.status === "expired" ? "续费" : "购买套餐"}？</p>
          </div>
        ),
        onOk: () => {
          window.open("/we-chat-app/admin/settings?tab=finance", "_blank")
        },
        okText: subscription.status === "expired" ? "去续费" : "去购买套餐",
        cancelText: "取消",
      })
      return false
    }

    // 2. 检查余额
    const hasEnoughBalance = this.actualBalance >= 0.1
    if (!hasEnoughBalance) {
      const isNegative = this.actualBalance < 0
      message.error(
        isNegative
          ? `账户已欠费 ${Math.abs(this.actualBalance).toFixed(2)} 塔币，请及时补缴`
          : "余额不足，请前往企业设置-账户进行充值"
      )
      setTimeout(() => {
        this.showRechargeModal(true)
      }, 500)
      return false
    }

    return true
  }
}

export const balanceStore = new BalanceStore()