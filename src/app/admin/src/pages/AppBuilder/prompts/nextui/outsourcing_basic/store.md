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
        id: "OEM-001",
        name: "10月抛光加工计划",
        product: "镀锡铜覆钢圆钢 BH-GW-R8",
        supplier: "常州金属加工厂",
        process: "抛光",
        planQuantity: 2000,
        processedQuantity: 1850,
        qualifiedQuantity: 1800,
        price: 2.5,
        amount: 4625,
        status: "completed",
        startDate: "2023-10-01",
        endDate: "2023-10-31"
      },
      {
        id: "OEM-002", 
        name: "9月抛光加工计划",
        product: "镀锡铜覆钢圆钢 BH-GW-R10",
        supplier: "苏州精密加工厂",
        process: "抛光",
        planQuantity: 1500,
        processedQuantity: 1200,
        qualifiedQuantity: 1150,
        price: 3.0,
        amount: 3600,
        status: "processing",
        startDate: "2023-09-26",
        endDate: "2023-11-02"
      },
      {
        id: "OEM-003",
        name: "8月抛光加工计划", 
        product: "镀锡铜覆钢圆钢 BH-GW-R12",
        supplier: "无锡金属制品厂",
        process: "抛光",
        planQuantity: 1000,
        processedQuantity: 0,
        qualifiedQuantity: 0,
        price: 3.5,
        amount: 0,
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
    const processed = this.items.reduce((acc, item) => acc + item.processedQuantity, 0);
    const qualified = this.items.reduce((acc, item) => acc + item.qualifiedQuantity, 0);
    const totalAmount = this.items.reduce((acc, item) => acc + item.amount, 0);
    
    return {
      totalPlan: total,
      totalProcessed: processed,
      totalQualified: qualified,
      totalAmount: totalAmount,
      processRate: total ? (processed / total * 100).toFixed(2) : 0,
      qualifiedRate: processed ? (qualified / processed * 100).toFixed(2) : 0
    };
  }

  // 获取供应商统计
  getSupplierStats() {
    const stats = {};
    this.items.forEach(item => {
      if (!stats[item.supplier]) {
        stats[item.supplier] = {
          totalQuantity: 0,
          totalAmount: 0,
          qualifiedRate: 0
        };
      }
      stats[item.supplier].totalQuantity += item.processedQuantity;
      stats[item.supplier].totalAmount += item.amount;
      if (item.processedQuantity > 0) {
        stats[item.supplier].qualifiedRate = (item.qualifiedQuantity / item.processedQuantity * 100).toFixed(2);
      }
    });
    return stats;
  }

  // 获取工序统计
  getProcessStats() {
    const stats = {};
    this.items.forEach(item => {
      if (!stats[item.process]) {
        stats[item.process] = {
          totalQuantity: 0,
          totalAmount: 0,
          averagePrice: 0
        };
      }
      stats[item.process].totalQuantity += item.processedQuantity;
      stats[item.process].totalAmount += item.amount;
      if (stats[item.process].totalQuantity > 0) {
        stats[item.process].averagePrice = (stats[item.process].totalAmount / stats[item.process].totalQuantity).toFixed(2);
      }
    });
    return stats;
  }
}

const store = new TableStore();
context.wpm.export('store_table', store);
</mo-ai-code>