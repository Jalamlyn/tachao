# DynamicForm 汇总信息计算指南

本文档专注于说明如何在 DynamicForm 中实现汇总信息的动态计算。

## 基本原理

汇总信息的计算主要通过 watch 函数来实现，它可以监听表单中特定字段的变化并进行实时计算。

## 实现示例

### 1. 基础计算示例

```typescript
const formConfig: DynamicFormConfig = {
  // ... 其他配置

  watch: (form) => {
    // 防止递归计算的标志位
    let isCalculating = false;

    const subscription = form.watch((value, { name }) => {
      // 只在相关字段变化时触发计算
      if (!isCalculating && name.startsWith('table.items.')) {
        isCalculating = true;
        try {
          // 获取表格数据
          const items = form.getValues('table.items') || [];
          
          // 计算汇总信息
          const totalAmount = items.reduce((sum, item) => 
            sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
          
          const itemCount = items.length;
          const avgPrice = itemCount > 0 ? totalAmount / itemCount : 0;
          
          // 更新汇总字段
          form.setValue('summary.amounts.totalAmount', totalAmount);
          form.setValue('summary.statistics.itemCount', itemCount);
          form.setValue('summary.statistics.avgPrice', avgPrice);
          
        } finally {
          isCalculating = false;
        }
      }
    });

    // 返回清理函数
    return () => subscription.unsubscribe();
  }
};
```

### 2. 复杂计算示例

```typescript
const formConfig: DynamicFormConfig = {
  watch: (form) => {
    let isCalculating = false;

    const calculateSummary = () => {
      const items = form.getValues('table.items') || [];
      const budget = form.getValues('form.basic.budgetInfo.amount') || 0;

      // 计算基础汇总数据
      const summary = items.reduce((acc, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const amount = quantity * price;

        return {
          totalAmount: acc.totalAmount + amount,
          totalQuantity: acc.totalQuantity + quantity,
          maxPrice: Math.max(acc.maxPrice, price),
          minPrice: acc.minPrice === 0 ? price : Math.min(acc.minPrice, price)
        };
      }, {
        totalAmount: 0,
        totalQuantity: 0,
        maxPrice: 0,
        minPrice: 0
      });

      // 计算衍生数据
      const itemCount = items.length;
      const avgPrice = itemCount > 0 ? summary.totalAmount / summary.totalQuantity : 0;
      const budgetUsage = budget > 0 ? (summary.totalAmount / budget) * 100 : 0;

      // 批量更新汇总信息
      const updates = {
        'summary.amounts.totalAmount': summary.totalAmount,
        'summary.amounts.budgetAmount': budget,
        'summary.amounts.usageRate': budgetUsage,
        'summary.statistics.itemCount': itemCount,
        'summary.statistics.totalQuantity': summary.totalQuantity,
        'summary.statistics.avgPrice': avgPrice,
        'summary.statistics.priceRange': `${summary.minPrice} - ${summary.maxPrice}`
      };

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value);
      });
    };

    const subscription = form.watch((value, { name }) => {
      if (!isCalculating && (
        name.startsWith('table.items.') || 
        name.startsWith('form.basic.budgetInfo.')
      )) {
        isCalculating = true;
        try {
          calculateSummary();
        } finally {
          isCalculating = false;
        }
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

## 最佳实践

### 1. 性能优化

```typescript
// 使用防抖优化频繁计算
import { debounce } from 'lodash';

const formConfig: DynamicFormConfig = {
  watch: (form) => {
    let isCalculating = false;

    // 使用防抖包装计算函数
    const debouncedCalculate = debounce(() => {
      if (isCalculating) return;
      isCalculating = true;
      try {
        // 执行计算逻辑
        const items = form.getValues('table.items') || [];
        // ... 计算过程
      } finally {
        isCalculating = false;
      }
    }, 300);

    const subscription = form.watch((value, { name }) => {
      if (name.startsWith('table.items.')) {
        debouncedCalculate();
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedCalculate.cancel();
    };
  }
};
```

### 2. 错误处理

```typescript
const formConfig: DynamicFormConfig = {
  watch: (form) => {
    const handleCalculation = () => {
      try {
        const items = form.getValues('table.items') || [];
        
        // 数据验证
        if (!Array.isArray(items)) {
          console.error('Invalid table data format');
          return;
        }

        // 安全的数值转换
        const summary = items.reduce((acc, item) => {
          const quantity = Number(item.quantity);
          const price = Number(item.price);

          if (isNaN(quantity) || isNaN(price)) {
            console.warn('Invalid number format in item:', item);
            return acc;
          }

          return {
            total: acc.total + (quantity * price)
          };
        }, { total: 0 });

        form.setValue('summary.amounts.total', summary.total);
        
      } catch (error) {
        console.error('Error calculating summary:', error);
        // 可以选择设置一个错误状态
        form.setValue('summary.error', '计算出错');
      }
    };

    const subscription = form.watch((value, { name }) => {
      if (name.startsWith('table.items.')) {
        handleCalculation();
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

### 3. 模块化计算

```typescript
// 将计算逻辑拆分为独立的函数
const calculateAmounts = (items: any[]) => {
  return items.reduce((acc, item) => ({
    totalAmount: acc.totalAmount + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    totalQuantity: acc.totalQuantity + (Number(item.quantity) || 0)
  }), { totalAmount: 0, totalQuantity: 0 });
};

const calculateStatistics = (items: any[], amounts: any) => {
  return {
    itemCount: items.length,
    avgPrice: items.length > 0 ? amounts.totalAmount / amounts.totalQuantity : 0
  };
};

const formConfig: DynamicFormConfig = {
  watch: (form) => {
    let isCalculating = false;

    const updateSummary = () => {
      const items = form.getValues('table.items') || [];
      
      // 分步骤计算
      const amounts = calculateAmounts(items);
      const statistics = calculateStatistics(items, amounts);

      // 批量更新
      form.setValue('summary.amounts', amounts);
      form.setValue('summary.statistics', statistics);
    };

    const subscription = form.watch((value, { name }) => {
      if (!isCalculating && name.startsWith('table.items.')) {
        isCalculating = true;
        try {
          updateSummary();
        } finally {
          isCalculating = false;
        }
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

## 注意事项

1. 始终使用标志位防止递归计算
2. 对数值进行安全转换和验证
3. 合理使用防抖优化性能
4. 妥善处理错误情况
5. 及时清理订阅，避免内存泄漏

## 常见问题

### 1. 计算不及时

如果发现计算不及时，可能是因为：
- watch 的字段路径不正确
- 防抖时间设置过长
- 计算过程中有性能问题

### 2. 重复计算

如果发现重复计算，检查：
- 是否正确使用了标志位
- watch 的触发条件是否过于宽泛
- 是否有多个 watch 在同时运行

### 3. 内存泄漏

预防内存泄漏的方法：
- 确保返回清理函数
- 取消未完成的防抖调用
- 清理定时器和事件监听器