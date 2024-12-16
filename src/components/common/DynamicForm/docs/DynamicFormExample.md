# 动态表单使用示例

本文档提供了一个完整的动态表单配置示例。

[原有的完整示例代码保持不变...]

## 格式化配置示例

### 1. 基本字段格式化

```typescript
const formConfig: DynamicFormConfig = {
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "amounts",
          title: "金额信息",
          fields: [
            {
              name: "form.basic.amount",
              label: "金额",
              type: "number",
              required: true,
              formatConfig: {
                type: "amount",
                precision: 2,
                currency: "CNY",
                conditions: [
                  {
                    condition: (value) => value < 0,
                    format: (value) => `(${Math.abs(value).toFixed(2)})`,
                    style: { color: 'red' }
                  }
                ]
              }
            },
            {
              name: "form.basic.percentage",
              label: "完成率",
              type: "number",
              formatConfig: {
                type: "percentage",
                precision: 1,
                conditions: [
                  {
                    condition: (value) => value >= 1,
                    format: (value) => `${(value * 100).toFixed(1)}%`,
                    style: { color: 'green', fontWeight: 'bold' }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
};
```

### 2. 表格列格式化

```typescript
const formConfig: DynamicFormConfig = {
  renderConfig: {
    tables: [
      {
        key: "items",
        title: "采购明细",
        config: {
          columns: [
            {
              key: "table.items.price",
              title: "单价",
              type: "number",
              width: 120,
              formatConfig: {
                type: "amount",
                precision: 2,
                currency: "CNY"
              }
            },
            {
              key: "table.items.quantity",
              title: "数量",
              type: "number",
              width: 100,
              formatConfig: {
                type: "number",
                precision: 0,
                useGrouping: true
              }
            },
            {
              key: "table.items.amount",
              title: "金额",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "amount",
                precision: 2,
                currency: "CNY",
                conditions: [
                  {
                    condition: (value) => value > 10000,
                    format: (value) => `¥${value.toFixed(2)}`,
                    style: { color: 'red', fontWeight: 'bold' }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
};
```

### 3. 汇总信息格式化

```typescript
const formConfig: DynamicFormConfig = {
  renderConfig: {
    summaryGroups: [
      {
        key: "amounts",
        title: "金额汇总",
        fields: [
          {
            name: "summary.amounts.total",
            label: "总金额",
            type: "amount",
            formatConfig: {
              type: "amount",
              precision: 2,
              currency: "CNY",
              format: (value, options) => {
                return `总计: ${new Intl.NumberFormat('zh-CN', {
                  style: 'currency',
                  currency: options.currency || 'CNY'
                }).format(value)}`;
              }
            }
          },
          {
            name: "summary.amounts.average",
            label: "平均金额",
            type: "amount",
            formatConfig: {
              type: "amount",
              precision: 2,
              currency: "CNY"
            }
          }
        ]
      }
    ]
  }
};
```

[原有的其他示例代码保持不变...]