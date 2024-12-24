import { makeAutoObservable } from 'mobx';
import globalStore from '@/globalStore';
import { message } from '@/components/Message';

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
      this.showRechargeModal(true);
    }
  }

  showRechargeModal(showConfirm = true) {
    if (showConfirm) {
      message.confirm({
        title: '余额不足提醒',
        content: (
          <div className="space-y-2">
            <p>当前账户余额不足，无法继续使用。</p>
            <p>是否立即充值？</p>
          </div>
        ),
        onOk: () => {
          this.isRechargeModalOpen = true;
        },
        okText: '去充值',
        cancelText: '取消'
      });
    } else {
      // 直接显示充值窗口（用于充值按钮点击等场景）
      this.isRechargeModalOpen = true;
    }
  }

  hideRechargeModal() {
    this.isRechargeModalOpen = false;
  }

  // 检查余额是否充足
  checkBalance(): boolean {
    const hasEnoughBalance = this.actualBalance >= 0.1;
    if (!hasEnoughBalance) {
      message.error('余额不足，请充值后继续使用');
      setTimeout(() => {
        this.showRechargeModal(true);
      }, 100);
    }
    return hasEnoughBalance;
  }
}

export const balanceStore = new BalanceStore();