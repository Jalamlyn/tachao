import { makeAutoObservable } from 'mobx';
import globalStore from '@/globalStore';

class BalanceStore {
  actualBalance: number = 0;
  isRechargeModalOpen: boolean = false;

  constructor() {
    makeAutoObservable(this);
    // 初始化时从 globalStore 同步数据，保持兼容性
    this.actualBalance = globalStore.actualBalance;
  }

  setActualBalance(balance: number) {
    this.actualBalance = balance;
    // 同步到 globalStore，保持兼容性
    globalStore.actualBalance = balance;
    
    // 当余额小于 0.1 时自动显示充值弹窗
    if (this.actualBalance < 0.1) {
      this.showRechargeModal();
    }
  }

  showRechargeModal() {
    this.isRechargeModalOpen = true;
  }

  hideRechargeModal() {
    this.isRechargeModalOpen = false;
  }

  // 检查余额是否充足
  checkBalance(): boolean {
    return this.actualBalance >= 0.1;
  }
}

export const balanceStore = new BalanceStore();