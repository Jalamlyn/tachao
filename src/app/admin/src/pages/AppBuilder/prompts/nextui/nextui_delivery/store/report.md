```jsx
<mo-ai-code type="store" name="store_report">
const {
  wpm,
  mobx,
  message
} = context;

const { makeAutoObservable } = mobx;
const deliveryStore = await context.wpm.import('store_delivery');

class ReportStore {
  // 当前选中的维度
  currentDimension = 'customer'; // 'customer' | 'product'
  
  // 时间范围
  dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  };

  // 缓存的报表数据
  reportCache = {
    customer: null,
    product: null
  };

  constructor() {
    makeAutoObservable(this);
  }

  // 设置维度
  setDimension(dimension) {
    this.currentDimension = dimension;
    this.generateReport();
  }

  // 设置时间范围
  setDateRange(start, end) {
    this.dateRange = { start, end };
    this.generateReport();
  }

  // 生成报表数据
  generateReport() {
    if (this.currentDimension === 'customer') {
      this.reportCache.customer = this.generateCustomerReport();
    } else {
      this.reportCache.product = this.generateProductReport();
    }
  }

  // 生成客户维度报表
  generateCustomerReport() {
    const customerStats = deliveryStore.getCustomerStatistics();
    
    // 按订单数量排序
    const orderRanking = [...customerStats].sort((a, b) => b.orderCount - a.orderCount);
    
    // 按消费金额排序
    const amountRanking = [...customerStats].sort((a, b) => b.totalAmount - a.totalAmount);
    
    // 计算平均订单金额
    const averageOrderAmount = customerStats.map(customer => ({
      name: customer.name,
      average: customer.totalAmount / customer.orderCount
    }));

    return {
      orderRanking: orderRanking.slice(0, 10),
      amountRanking: amountRanking.slice(0, 10),
      averageOrderAmount
    };
  }

  // 生成商品维度报表
  generateProductReport() {
    const productStats = deliveryStore.getProductStatistics();
    
    // 按销售数量排序
    const quantityRanking = [...productStats].sort((a, b) => b.quantity - a.quantity);
    
    // 按销售金额排序
    const amountRanking = [...productStats].sort((a, b) => b.amount - a.amount);
    
    // 计算平均单价
    const averagePrice = productStats.map(product => ({
      name: product.name,
      average: product.amount / product.quantity
    }));

    return {
      quantityRanking: quantityRanking.slice(0, 10),
      amountRanking: amountRanking.slice(0, 10),
      averagePrice
    };
  }

  // 获取当前报表数据
  getCurrentReport() {
    return this.reportCache[this.currentDimension];
  }

  // 刷新报表数据
  refreshReport() {
    this.reportCache = {
      customer: null,
      product: null
    };
    this.generateReport();
  }
}

const store = new ReportStore();
context.wpm.export('store_report', store);
</mo-ai-code>
```