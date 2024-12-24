import { makeAutoObservable } from "mobx"
import globalStore from "@/globalStore"
import { message } from "@/components/Message"

class BalanceStore {
  actualBalance: number = 0
  isRechargeModalOpen: boolean = false

  constructor() {
    makeAutoObservable(this)
    // 初始化时从 globalStore 同步数据，保持兼容性
    this.actualBalance = globalStore.actualBalance
  }

  setActualBalance(balance: number) {
    this.actualBalance = balance
    // 同步到 globalStore，保持兼容性
    globalStore.actualBalance = balance
  }

  showRechargeModal(showConfirm = true) {
    if (showConfirm) {
      // 保留原有的确认框逻辑，以保持兼容性
      message.confirm({
        title: "余额不足提醒",
        content: (
          <div className='space-y-2'>
            <p>当前账户余额不足，无法继续使用。</p>
            <p>是否前往充值页面？</p>
          </div>
        ),
        onOk: () => {
          window.open("/we-chat-app/admin/settings?tab=finance", "_blank")
        },
        okText: "去充值",
        cancelText: "取消",
      })
    } else {
      // 直接显示充值窗口（用于充值按钮点击等场景）
      this.isRechargeModalOpen = true
    }
  }

  hideRechargeModal() {
    this.isRechargeModalOpen = false
  }

  // 检查余额是否充足
  checkBalance(): boolean {
    const hasEnoughBalance = this.actualBalance >= 0.1
    if (!hasEnoughBalance) {
      message.error("余额不足，请前往企业设置-账户进行充值")
      setTimeout(() => {
        this.showRechargeModal(true)
      }, 500) // 延迟跳转，让用户能看到提示消息
    }
    return hasEnoughBalance
  }
}

export const balanceStore = new BalanceStore()
