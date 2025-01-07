```jsx
<mo-ai-code type="component" name="comp_ai_context">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Button } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');


  const generateContext = () => {
    const stats = deliveryStore.getStatistics();
    const customerStats = deliveryStore.getCustomerStatistics();
    const productStats = deliveryStore.getProductStatistics();

    return `系统当前状态：
- 总订单数：${stats.total}
- 待处理订单：${stats.pending}
- 配送中订单：${stats.delivering}
- 已完成订单：${stats.completed}

热门客户TOP3：
${customerStats.slice(0, 3).map((customer, index) =>
  `${index + 1}. ${customer.name} - ${customer.orderCount}单`
).join('\n')}

热门商品TOP3：
${productStats.slice(0, 3).map((product, index) =>
  `${index + 1}. ${product.name} - 销量${product.quantity}`
).join('\n')}`;
  };

  const getOrderContext = (orderId) => {
    const order = deliveryStore.getOrderById(orderId);
    if (!order) return '';

    return `订单信息：
- 客户：${order.customerName}
- 联系人：${order.contactPerson}
- 电话：${order.contactPhone}
- 地址：${order.address}
- 送货日期：${order.deliveryTime}
- 状态：${order.status === 'completed' ? '已完成' : order.status === 'delivering' ? '配送中' : '待处理'}

商品明细：
${order.items.map((item, index) =>
  `${index + 1}. ${item.name} - ${item.quantity}件 - ¥${item.price}/件 - 小计：¥${item.amount}`
).join('\n')}

总金额：¥${order.items.reduce((sum, item) => sum + item.amount, 0)}`;
  };



context.wpm.export('comp_ai_context', {
    generateContext,
    getOrderContext
  });
</mo-ai-code>
```
