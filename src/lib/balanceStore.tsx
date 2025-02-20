import { makeAutoObservable } from "mobx"
import { getPublicMetaData, setMetadata } from "@/lib/metadata"
import message from "@/lib/Message"
import { subscriptionService } from "@/lib/permissionUtils"
import globalStore from "@/lib/globalStore"
import { costService } from "@/lib/costService"
import { getAccount } from "@/lib/pay"

interface AccountBalance {
  used: number
}

interface AccountBalances {
  [accountId: string]: AccountBalance
}

class BalanceStore {
  balance: number = 0
  actualBalance: number = 0
  loading: boolean = false
  isRechargeModalOpen: boolean = false
  private readonly ACCOUNT_BALANCE_KEY = "account-balances"

  constructor() {
    makeAutoObservable(this)
  }

  setBalance(balance: number) {
    this.balance = balance
  }

  setActualBalance(balance: number) {
    this.actualBalance = balance
  }

  setLoading(loading: boolean) {
    this.loading = loading
  }

  showRechargeModal(isSubscription: boolean = false) {
    this.isRechargeModalOpen = true
  }

  hideRechargeModal() {
    this.isRechargeModalOpen = false
  }

  // 获取所有账号额度信息
  async getAccountBalances(): Promise<AccountBalances> {
    try {
      const res = await getPublicMetaData([this.ACCOUNT_BALANCE_KEY])
      return res?.data?.[0]?.value ? JSON.parse(res.data[0].value) : {}
    } catch (error) {
      console.error("Failed to get account balances:", error)
      return {}
    }
  }

  // 保存账户余额信息
  private async saveAccountBalances(balances: AccountBalances) {
    try {
      await setMetadata(this.ACCOUNT_BALANCE_KEY, JSON.stringify(balances))
    } catch (error) {
      console.error("Failed to save account balances:", error)
      throw error
    }
  }

  // 更新账户使用额度
  async updateAccountUsage(accountId: string, cost: number): Promise<boolean> {
    try {
      // 1. 获取当前所有账户的余额数据
      const res = await getPublicMetaData([this.ACCOUNT_BALANCE_KEY])
      let balances = res?.data?.[0]?.value ? JSON.parse(res.data[0].value) : {}

      // 2. 更新指定账户的已使用额度(累加)
      balances[accountId] = balances[accountId] || { used: 0 }
      balances[accountId].used = Number((balances[accountId].used + cost).toFixed(4))

      // 3. 保存更新后的数据
      await setMetadata(this.ACCOUNT_BALANCE_KEY, JSON.stringify(balances))

      return true
    } catch (error) {
      console.error(`Failed to update account usage for ${accountId}:`, error)
      return false
    }
  }

  // 获取账号额度信息
  async getAccountBalance(accountId: string): Promise<AccountBalance> {
    const balances = await this.getAccountBalances()
    return balances[accountId] || { used: 0 }
  }

  async checkBalance(cost: number = 0.1): Promise<boolean> {
    await this.fetchBalance()
    // 检查订阅状态
    const subscription = await subscriptionService.getSubscription(globalStore.organizationId)
    if (!subscription) {
      message.error("请先在充值界面购买套餐，个人套餐或者企业套餐")
      this.showRechargeModal(true)
      return false
    }

    // 检查套餐是否过期
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(globalStore.organizationId)
    if (subscriptionStatus.status === "expired") {
      message.error(
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <span>您的套餐已过期,请续费后继续使用</span>
          </div>
          <div className='text-xs text-default-500'>提示:续费套餐后即可继续使用AI功能</div>
        </div>,
        { duration: 5000 }
      )

      this.showRechargeModal(true)
      return false
    }

    // 检查总余额
    const hasEnoughBalance = this.actualBalance >= cost
    if (!hasEnoughBalance) {
      message.error(
        <div>
          <p>余额不足,请充值</p>
          <p className='text-xs text-gray-500'>当前余额: {this.actualBalance.toFixed(2)} 梦想币</p>
        </div>
      )
      this.showRechargeModal(false)
      return false
    }

    return true
  }

  async fetchBalance() {
    this.setLoading(true)
    try {
      // 获取总余额
      const balanceRes = await getPublicMetaData(["balance"])
      const totalBalance = balanceRes?.data?.[0]?.value ? Number(balanceRes.data[0].value) : 0
      this.setBalance(totalBalance)
      // 获取总消费
      const costTotal = await costService.getCostTotal()
      const accountRes = await getAccount()
      const totalCost = costTotal.totalCost || 0

      // 计算实际可用余额
      const actualBalance = (accountRes.totalComputePower / 100).toFixed(2) - totalCost
      this.setActualBalance(actualBalance)

      // 同步到全局状态
      globalStore.actualBalance = actualBalance
    } catch (error) {
      console.error("Failed to fetch balance", error)
    } finally {
      this.setLoading(false)
    }
  }
}

export const balanceStore = new BalanceStore()