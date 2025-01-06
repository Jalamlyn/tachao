<mo-ai-code type="store" name="store_table">
const {
  wpm,
  mobx
} = context;

const { makeAutoObservable } = mobx;

class TableStore {
  items = [];

  constructor() {
    makeAutoObservable(this);

    // 初始化示例数据
    this.items = [
      {
        id: "PLAN-001",
        name: "第10月生产计划2023.10B05",
        product: "镀锡铜覆钢圆钢 BH-GW-R8",
        workshop: "抛光",
        planQuantity: 2000,
        finishQuantity: 1850,
        qualifiedQuantity: 1850,
        status: "completed",
        startDate: "2023-10-01",
        endDate: "2023-10-31"
      },
      {
        id: "PLAN-002", 
        name: "第9月生产计划2023.09B02",
        product: "镀锡铜覆钢圆钢 BH-GW-R10",
        workshop: "抛光",
        planQuantity: 1500,
        finishQuantity: 1200,
        qualifiedQuantity: 1150,
        status: "processing",
        startDate: "2023-09-26",
        endDate: "2023-11-02"
      },
      {
        id: "PLAN-003",
        name: "第8月生产计划2023.08B01", 
        product: "镀锡铜覆钢圆钢 BH-GW-R12",
        workshop: "抛光",
        planQuantity: 1000,
        finishQuantity: 0,
        qualifiedQuantity: 0,
        status: "pending",
        startDate: "2023-08-15",
        endDate: "2023-09-15"
      }
    ];
  }

  setItems(items) {
    this.items = items;
  }

  addItem(item) {
    this.items.push(item);
  }

  updateItem(id, data) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
    }
  }

  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
  }

  getStatistics() {
    const total = this.items.reduce((acc, item) => acc + item.planQuantity, 0);
    const finished = this.items.reduce((acc, item) => acc + item.finishQuantity, 0);
    const qualified = this.items.reduce((acc, item) => acc + item.qualifiedQuantity, 0);
    
    return {
      totalPlan: total,
      totalFinish: finished,
      totalQualified: qualified,
      finishRate: total ? (finished / total * 100).toFixed(2) : 0,
      qualifiedRate: finished ? (qualified / finished * 100).toFixed(2) : 0
    };
  }
}

const store = new TableStore();
context.wpm.export('store_table', store);
</mo-ai-code>