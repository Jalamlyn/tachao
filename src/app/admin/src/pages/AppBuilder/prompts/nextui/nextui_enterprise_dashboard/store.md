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
        productCode: "A001",
        workshop: "抛光",
        workshopCode: "GX005",
        planQuantity: 2000,
        finishQuantity: 1850,
        qualifiedQuantity: 1850,
        unit: "百米",
        status: "completed",
        startDate: "2023-10-01",
        endDate: "2023-10-31",
        planCode: "SCJH-231017-06"
      },
      {
        id: "PLAN-002", 
        name: "第9月生产计划2023.09B02",
        product: "镀锡铜覆钢圆钢 BH-GW-R10",
        productCode: "A002",
        workshop: "抛光",
        workshopCode: "GX005",
        planQuantity: 1500,
        finishQuantity: 1200,
        qualifiedQuantity: 1150,
        unit: "百米",
        status: "processing",
        startDate: "2023-09-26",
        endDate: "2023-11-02",
        planCode: "SCJH-231017-07"
      },
      {
        id: "PLAN-003",
        name: "第8月生产计划2023.08B01", 
        product: "镀锡铜覆钢圆钢 BH-GW-R12",
        productCode: "A003",
        workshop: "抛光",
        workshopCode: "GX005",
        planQuantity: 1000,
        finishQuantity: 0,
        qualifiedQuantity: 0,
        unit: "百米",
        status: "pending",
        startDate: "2023-08-15",
        endDate: "2023-09-15",
        planCode: "SCJH-231017-08"
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
      qualifiedRate: finished ? (qualified / finished * 100).toFixed(2) : 0,
      targetCompletionRate: total ? ((qualified / total) * 100).toFixed(2) : 0
    };
  }

  exportToCSV(data) {
    const headers = [
      '计划编号',
      '计划名称',
      '产品名称',
      '产品编码',
      '工序名称',
      '工序编码',
      '计划数量',
      '完成数量',
      '合格数量',
      '单位',
      '状态',
      '开始日期',
      '结束日期',
      '计划编码'
    ];

    const rows = data.map(item => [
      item.id,
      item.name,
      item.product,
      item.productCode,
      item.workshop,
      item.workshopCode,
      item.planQuantity,
      item.finishQuantity,
      item.qualifiedQuantity,
      item.unit,
      this.getStatusText(item.status),
      item.startDate,
      item.endDate,
      item.planCode
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  getStatusText(status) {
    const statusMap = {
      pending: '待计划',
      processing: '进行中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  }

  getChartData() {
    const chartData = [];
    
    this.items.forEach(item => {
      // 计划数量数据点
      chartData.push({
        date: new Date(item.startDate).toLocaleDateString(),
        category: '计划数量',
        value: item.planQuantity
      });
      
      // 完成数量数据点
      chartData.push({
        date: new Date(item.startDate).toLocaleDateString(),
        category: '完成数量',
        value: item.finishQuantity
      });
      
      // 合格数量数据点
      chartData.push({
        date: new Date(item.startDate).toLocaleDateString(),
        category: '合格数量',
        value: item.qualifiedQuantity
      });
    });

    return chartData;
  }
}

const store = new TableStore();
context.wpm.export('store_table', store);
</mo-ai-code>