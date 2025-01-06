```jsx
<mo-ai-code type="store" name="store_delivery">
const {
  wpm,
  mobx,
  message,
  api,
  appId
} = context;

const { makeAutoObservable } = mobx;

class DeliveryStore {
  // 送货单列表
  deliveryOrders = [];
  
  // 当前编辑的送货单
  currentOrder = null;
  
  // 加载状态
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // 加载送货单列表
  async loadDeliveryOrders() {
    this.isLoading = true;
    try {
      const result = await api.getMetadata([`${appId}_delivery_orders`]);
      if (result.data?.[0]?.value) {
        this.deliveryOrders = JSON.parse(result.data[0].value);
      }
    } catch (error) {
      console.error('Failed to load delivery orders:', error);
      message.error('加载送货单失败');
    } finally {
      this.isLoading = false;
    }
  }

  // 保存送货单
  async saveDeliveryOrder(order) {
    try {
      const newOrder = {
        ...order,
        id: order.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (order.id) {
        // 更新
        const index = this.deliveryOrders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.deliveryOrders[index] = newOrder;
        }
      } else {
        // 新建
        this.deliveryOrders.unshift(newOrder);
      }

      // 保存到元数据
      await api.setMetadata(`${appId}_delivery_orders`, JSON.stringify(this.deliveryOrders));
      
      message.success('保存成功');
      return true;
    } catch (error) {
      console.error('Failed to save delivery order:', error);
      message.error('保存失败');
      return false;
    }
  }

  // 删除送货单
  async deleteDeliveryOrder(id) {
    try {
      this.deliveryOrders = this.deliveryOrders.filter(order => order.id !== id);
      await api.setMetadata(`${appId}_delivery_orders`, JSON.stringify(this.deliveryOrders));
      message.success('删除成功');
      return true;
    } catch (error) {
      console.error('Failed to delete delivery order:', error);
      message.error('删除失败');
      return false;
    }
  }

  // 设置当前编辑的送货单
  setCurrentOrder(order) {
    this.currentOrder = order;
  }

  // 清除当前编辑的送货单
  clearCurrentOrder() {
    this.currentOrder = null;
  }

  // 获取送货单详情
  getOrderById(id) {
    return this.deliveryOrders.find(order => order.id === id);
  }

  // 获取统计数据
  getStatistics() {
    const total = this.deliveryOrders.length;
    const pending = this.deliveryOrders.filter(o => o.status === 'pending').length;
    const delivering = this.deliveryOrders.filter(o => o.status === 'delivering').length;
    const completed = this.deliveryOrders.filter(o => o.status === 'completed').length;

    return {
      total,
      pending,
      delivering,
      completed
    };
  }

  // 获取客户统计数据
  getCustomerStatistics() {
    const customerMap = new Map();
    
    this.deliveryOrders.forEach(order => {
      const customer = customerMap.get(order.customerName) || {
        orderCount: 0,
        totalAmount: 0
      };
      
      customer.orderCount++;
      customer.totalAmount += order.items.reduce((sum, item) => sum + item.amount, 0);
      
      customerMap.set(order.customerName, customer);
    });

    return Array.from(customerMap.entries()).map(([name, stats]) => ({
      name,
      ...stats
    }));
  }

  // 获取商品统计数据
  getProductStatistics() {
    const productMap = new Map();
    
    this.deliveryOrders.forEach(order => {
      order.items.forEach(item => {
        const product = productMap.get(item.name) || {
          quantity: 0,
          amount: 0
        };
        
        product.quantity += item.quantity;
        product.amount += item.amount;
        
        productMap.set(item.name, product);
      });
    });

    return Array.from(productMap.entries()).map(([name, stats]) => ({
      name,
      ...stats
    }));
  }
}

const store = new DeliveryStore();
context.wpm.export('store_delivery', store);
</mo-ai-code>
```