## 表格配置

表格配置用于创建动态表格，通常用于录入多行数据。

```typescript
interface TableConfig {
  columns: TableColumn[];
  summary?: TableSummary;
  rowCalculations?: TableRowCalculations;
}

interface TableColumn {
  key: string;
  title: string;
  type: TableColumnType;
  width?: string | number;
  editable?: boolean;
  required?: boolean;
}
```

### 基础示例

```javascript
const tableConfig = {
  columns: [
    { key: "item", title: "物品", type: "text", required: true },
    { key: "quantity", title: "数量", type: "number", width: 100 },
    { key: "price", title: "单价", type: "number", width: 100 },
    { 
      key: "total", 
      title: "小计", 
      type: "number", 
      width: 100,
      render: (value, record) => record.quantity * record.price
    }
  ],
  summary: {
    fields: {
      totalAmount: {
        label: "总金额",
        calculate: (records) => records.reduce((sum, record) => sum + (record.quantity * record.price), 0)
      }
    }
  }
};
```

### 使用 Watch 实现计算和汇总

推荐使用统一的 watch 机制来处理表格的计算和汇总逻辑:

```typescript
const config: DynamicFormConfig = {
  renderConfig: {
    // 基础字段配置(包括汇总字段)
    basicFields: [
      // ... 其他字段
      {
        name: "totalAmount",
        label: "总金额",
        type: "number",
        disabled: true // 计算字段通常是禁用的
      }
    ],
    // 表格配置
    table: {
      columns: [
        { key: "item", title: "物品", type: "text", required: true },
        { key: "quantity", title: "数量", type: "number", width: 100 },
        { key: "price", title: "单价", type: "number", width: 100 },
        { 
          key: "subtotal", 
          title: "小计", 
          type: "number",
          width: 100,
          disabled: true // 计算字段通常是禁用的
        }
      ]
    }
  },
  // 使用统一的 watch 来处理计算逻辑
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 处理表格数据变化
      if (name.startsWith('tableData')) {
        const tableData = form.getValues('tableData') || [];
        
        // 批量更新以提高性能
        form.batch(() => {
          // 计算每行小计
          tableData.forEach((row, index) => {
            const quantity = Number(row.quantity) || 0;
            const price = Number(row.price) || 0;
            const subtotal = quantity * price;
            
            // 更新行小计
            form.setValue(`tableData.${index}.subtotal`, subtotal);
          });
          
          // 计算总金额
          const totalAmount = tableData.reduce((sum, row) => {
            return sum + (Number(row.subtotal) || 0);
          }, 0);
          
          // 更新总金额字段
          form.setValue('totalAmount', totalAmount);
        });
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

### 性能优化建议

1. **使用批量更新**
```typescript
form.batch(() => {
  // 在这里进行多个 setValue 操作
  updates.forEach(({ field, value }) => {
    form.setValue(field, value);
  });
});
```

2. **避免不必要的计算**
```typescript
// 只在相关字段变化时进行计算
if (name.startsWith('tableData') && (name.includes('.quantity') || name.includes('.price'))) {
  // 执行计算逻辑
}
```

3. **使用防抖**
```typescript
import { debounce } from 'lodash';

const debouncedCalculate = debounce((tableData) => {
  // 执行计算逻辑
}, 300);
```

### 复杂计算示例

```typescript
const config: DynamicFormConfig = {
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name.startsWith('tableData')) {
        const tableData = form.getValues('tableData') || [];
        
        form.batch(() => {
          // 1. 计算每行的小计
          tableData.forEach((row, index) => {
            const quantity = Number(row.quantity) || 0;
            const price = Number(row.price) || 0;
            const discount = Number(row.discount) || 0;
            
            // 计算折扣后金额
            const subtotal = quantity * price * (1 - discount / 100);
            form.setValue(`tableData.${index}.subtotal`, subtotal);
          });
          
          // 2. 计算商品总数
          const totalQuantity = tableData.reduce((sum, row) => {
            return sum + (Number(row.quantity) || 0);
          }, 0);
          form.setValue('totalQuantity', totalQuantity);
          
          // 3. 计算总金额
          const totalAmount = tableData.reduce((sum, row) => {
            return sum + (Number(row.subtotal) || 0);
          }, 0);
          form.setValue('totalAmount', totalAmount);
          
          // 4. 计算税费
          const tax = totalAmount * 0.1; // 假设税率为 10%
          form.setValue('tax', tax);
          
          // 5. 计算最终金额
          form.setValue('finalAmount', totalAmount + tax);
        });
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

### 最佳实践

1. **统一使用 watch**
   - 所有计算逻辑集中在一处
   - 便于维护和调试
   - 保持代码一致性

2. **性能优化**
   - 使用批量更新
   - 避免不必要的计算
   - 合理使用防抖

3. **状态管理**
   - 计算结果存储在表单状态中
   - 支持表单验证和提交
   - 便于实现撤销/重做功能

4. **错误处理**
   - 处理数值转换异常
   - 处理空值和非法值
   - 提供友好的错误提示