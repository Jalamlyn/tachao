# DynamicForm 统一格式化系统

本文档介绍了 DynamicForm 组件的统一格式化系统，包括配置方法、使用示例和最佳实践。

## 格式化配置

### 基础配置

```typescript
interface FormatOptions {
  // 基础配置
  type?: 'amount' | 'percentage' | 'number' | 'text' | 'date' | 'datetime' | 'custom';
  precision?: number;
  
  // 货币配置
  currency?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  
  // 日期配置
  dateFormat?: string;
  timezone?: string;
  
  // 数字配置
  useGrouping?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  
  // 自定义格式化
  format?: (value: any, options?: any) => string;
  
  // 条件格式化
  conditions?: Array<{
    condition: (value: any) => boolean;
    format: (value: any) => string;
    style?: React.CSSProperties;
  }>;
}
```

## 使用示例

### 1. 基本字段格式化

```typescript
const fieldConfig = {
  name: "form.basic.amount",
  label: "金额",
  type: "number",
  formatConfig: {
    type: "amount",
    precision: 2,
    currency: "CNY",
    currencyDisplay: "symbol"
  }
};
```

### 2. 表格列格式化

```typescript
const columnConfig = {
  key: "table.items.price",
  title: "单价",
  type: "number",
  formatConfig: {
    type: "amount",
    precision: 2,
    conditions: [
      {
        condition: (value) => value < 0,
        format: (value) => `(${Math.abs(value).toFixed(2)})`,
        style: { color: 'red' }
      }
    ]
  }
};
```

### 3. 汇总字段格式化

```typescript
const summaryConfig = {
  name: "summary.amounts.total",
  label: "总金额",
  type: "amount",
  formatConfig: {
    type: "amount",
    precision: 2,
    format: (value, options) => {
      return `总计: ${new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: options.currency || 'CNY'
      }).format(value)}`;
    }
  }
};
```

### 4. 条件格式化示例

```typescript
const fieldConfig = {
  name: "form.basic.score",
  label: "得分",
  type: "number",
  formatConfig: {
    type: "number",
    precision: 1,
    conditions: [
      {
        condition: (value) => value >= 90,
        format: (value) => `${value} - 优秀`,
        style: { color: 'green', fontWeight: 'bold' }
      },
      {
        condition: (value) => value >= 60 && value < 90,
        format: (value) => `${value} - 合格`,
        style: { color: 'blue' }
      },
      {
        condition: (value) => value < 60,
        format: (value) => `${value} - 不合格`,
        style: { color: 'red' }
      }
    ]
  }
};
```

### 5. 自定义格式化示例

```typescript
const fieldConfig = {
  name: "form.basic.custom",
  label: "自定义",
  type: "text",
  formatConfig: {
    type: "custom",
    format: (value, options) => {
      // 自定义格式化逻辑
      return `[${value}]`;
    }
  }
};
```

## 预设格式化配置

系统提供了一些常用的预设格式化配置：

```typescript
const defaultFormatConfig = {
  amount: {
    type: 'amount',
    precision: 2,
    currency: 'CNY'
  },
  percentage: {
    type: 'percentage',
    precision: 2
  },
  number: {
    type: 'number',
    precision: 0,
    useGrouping: true
  },
  date: {
    type: 'date',
    dateFormat: 'yyyy-MM-dd'
  },
  datetime: {
    type: 'datetime',
    dateFormat: 'yyyy-MM-dd HH:mm:ss'
  }
};
```

## 最佳实践

### 1. 金额格式化

```typescript
// 推荐的金额格式化配置
const amountFormat = {
  type: 'amount',
  precision: 2,
  currency: 'CNY',
  conditions: [
    {
      condition: (value) => value < 0,
      format: (value) => `(${Math.abs(value).toFixed(2)})`,
      style: { color: 'red' }
    }
  ]
};
```

### 2. 百分比格式化

```typescript
// 推荐的百分比格式化配置
const percentageFormat = {
  type: 'percentage',
  precision: 2,
  conditions: [
    {
      condition: (value) => value > 1,
      format: (value) => `${(value * 100).toFixed(2)}%`,
      style: { color: 'red' }
    },
    {
      condition: (value) => value < 0,
      format: (value) => `0%`,
      style: { color: 'gray' }
    }
  ]
};
```

### 3. 日期格式化

```typescript
// 推荐的日期格式化配置
const dateFormat = {
  type: 'date',
  dateFormat: 'yyyy-MM-dd',
  format: (value) => {
    if (!value) return '-';
    try {
      return format(new Date(value), 'yyyy-MM-dd');
    } catch {
      return String(value);
    }
  }
};
```

## 注意事项

1. 性能考虑
   - 使用缓存格式化结果
   - 避免在条件格式化中进行复杂计算

2. 错误处理
   - 始终处理空值情况
   - 使用 try-catch 包装格式化逻辑

3. 国际化支持
   - 使用 Intl API 进行数字和货币格式化
   - 考虑时区问题

4. 向后兼容
   - 保持对旧版格式化配置的支持
   - 优先使用新的格式化系统

## 常见问题

### Q1: 如何处理空值？

```typescript
const formatConfig = {
  type: 'amount',
  format: (value) => {
    if (value === null || value === undefined) {
      return '-';
    }
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(value);
  }
};
```

### Q2: 如何添加自定义样式？

```typescript
const formatConfig = {
  type: 'number',
  conditions: [
    {
      condition: (value) => true,
      format: (value) => String(value),
      style: {
        color: 'blue',
        fontWeight: 'bold',
        fontSize: '1.2em'
      }
    }
  ]
};
```

### Q3: 如何处理复杂的格式化逻辑？

```typescript
const formatConfig = {
  type: 'custom',
  format: (value, options) => {
    // 拆分复杂逻辑为多个函数
    const processValue = (val) => {
      // 处理逻辑
    };
    
    const formatValue = (val) => {
      // 格式化逻辑
    };
    
    return formatValue(processValue(value));
  }
};
```