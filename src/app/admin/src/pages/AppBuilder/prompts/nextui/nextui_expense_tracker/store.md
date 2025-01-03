```jsx
<mo-ai-code type="store" name="store_expense">
const {
  wpm,
  React,
  ReactRouterDom,
  observer,
  NextUI,
  Icon,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId
} = context;

const { makeAutoObservable } = mobx;

class ExpenseStore {
  isLoading = false;
  currentExpense = null;
  expenseHistory = [];

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentExpense(expense) {
    this.currentExpense = expense;
  }

  clearCurrentExpense() {
    this.currentExpense = null;
  }

  async loadExpenseHistory() {
    this.isLoading = true;
    try {
      const result = await api.getMetadata([`${appId}_expenses`]);
      if (result.data?.[0]?.value) {
        this.expenseHistory = JSON.parse(result.data[0].value);
      }
    } catch (error) {
      console.error('Failed to load expense history:', error);
      message.error('加载历史记录失败');
    } finally {
      this.isLoading = false;
    }
  }

  async saveExpense(expense) {
    try {
      const newExpense = {
        ...expense,
        createdAt: new Date().toISOString()
      };

      // 添加到历史记录
      this.expenseHistory.unshift(newExpense);
      
      // 只保留最近20条记录
      if (this.expenseHistory.length > 20) {
        this.expenseHistory = this.expenseHistory.slice(0, 20);
      }

      // 保存到元数据
      await api.setMetadata(`${appId}_expenses`, this.expenseHistory);
      
      this.clearCurrentExpense();
      return true;
    } catch (error) {
      console.error('Failed to save expense:', error);
      message.error('保存失败');
      return false;
    }
  }
}

const store = new ExpenseStore();
wpm.export('store_expense', store);
</mo-ai-code>
```