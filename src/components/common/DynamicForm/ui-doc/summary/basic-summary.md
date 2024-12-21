# 基础汇总

## 简单汇总
```typescript
{
  summaryGroups: [
    {
      key: "basicSummary",
      title: "基础汇总",
      fields: [
        {
          name: "total",
          label: "总计",
          type: "amount"
        }
      ]
    }
  ]
}
```
基础的汇总配置。

## 带图标和描述的汇总
```typescript
{
  summaryGroups: [
    {
      key: "detailSummary",
      title: "详细汇总",
      icon: "mdi:calculator",
      description: "显示各项统计数据",
      fields: [
        {
          name: "income",
          label: "收入",
          type: "amount"
        },
        {
          name: "expense",
          label: "支出",
          type: "amount"
        }
      ]
    }
  ]
}
```
支持图标和描述信息。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "基础汇总示例"
  },
  renderConfig: {
    summaryGroups: [
      {
        key: "financialSummary",
        title: "财务汇总",
        icon: "mdi:finance",
        description: "显示主要财务指标",
        layout: "grid",
        columns: 3,
        fields: [
          {
            name: "totalIncome",
            label: "总收入",
            type: "amount",
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "totalExpense",
            label: "总支出",
            type: "amount",
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "netIncome",
            label: "净收入",
            type: "amount",
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2,
                conditions: [
                  {
                    condition: value => value > 0,
                    style: { color: "green" }
                  },
                  {
                    condition: value => value < 0,
                    style: { color: "red" }
                  }
                ]
              }
            }
          },
          {
            name: "incomeGrowth",
            label: "收入增长",
            type: "percentage",
            trend: "up",
            formatConfig: {
              type: "percentage",
              precision: 2,
              conditions: [
                {
                  condition: value => value > 0,
                  style: { color: "green" }
                },
                {
                  condition: value => value < 0,
                  style: { color: "red" }
                }
              ]
            }
          },
          {
            name: "expenseRatio",
            label: "支出比率",
            type: "percentage",
            trend: "down",
            formatConfig: {
              type: "percentage",
              precision: 2
            }
          },
          {
            name: "profitMargin",
            label: "利润率",
            type: "percentage",
            formatConfig: {
              type: "percentage",
              precision: 2
            }
          }
        ]
      },
      {
        key: "operationalSummary",
        title: "运营汇总",
        icon: "mdi:chart-line",
        description: "显示主要运营指标",
        layout: "grid",
        columns: 4,
        fields: [
          {
            name: "totalOrders",
            label: "订单总数",
            type: "number",
            formatConfig: {
              type: "number",
              useGrouping: true,
              precision: 0
            }
          },
          {
            name: "averageOrderValue",
            label: "平均订单金额",
            type: "amount",
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "customerSatisfaction",
            label: "客户满意度",
            type: "percentage",
            formatConfig: {
              type: "percentage",
              precision: 1,
              conditions: [
                {
                  condition: value => value >= 90,
                  style: { color: "green" }
                },
                {
                  condition: value => value < 60,
                  style: { color: "red" }
                }
              ]
            }
          },
          {
            name: "returnRate",
            label: "退货率",
            type: "percentage",
            trend: "down",
            formatConfig: {
              type: "percentage",
              precision: 2
            }
          }
        ]
      }
    ]
  }
}
```