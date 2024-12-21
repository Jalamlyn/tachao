# 自动计算汇总

## 基础自动计算
```typescript
{
  summaryGroups: [
    {
      key: "autoSummary",
      title: "自动计算汇总",
      fields: [
        {
          name: "total",
          label: "总计",
          type: "amount",
          compute: (data) => {
            return data.items.reduce((sum, item) => sum + item.amount, 0)
          }
        }
      ]
    }
  ]
}
```
基础的自动计算配置。

## 复杂计算
```typescript
{
  summaryGroups: [
    {
      key: "complexSummary",
      title: "复杂计算汇总",
      fields: [
        {
          name: "subtotal",
          label: "小计",
          type: "amount",
          compute: (data) => {
            return data.items.reduce((sum, item) => sum + item.amount, 0)
          }
        },
        {
          name: "tax",
          label: "税额",
          type: "amount",
          compute: (data, summary) => {
            return summary.subtotal * 0.13
          }
        },
        {
          name: "total",
          label: "总计",
          type: "amount",
          compute: (data, summary) => {
            return summary.subtotal + summary.tax
          }
        }
      ]
    }
  ]
}
```
支持复杂的计算逻辑。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "自动计算汇总示例"
  },
  renderConfig: {
    summaryGroups: [
      {
        key: "orderSummary",
        title: "订单汇总",
        icon: "mdi:calculator",
        description: "自动计算订单相关金额",
        layout: "grid",
        columns: 3,
        fields: [
          {
            name: "subtotal",
            label: "商品小计",
            type: "amount",
            compute: (data) => {
              return (data.tableData?.orderItems || []).reduce((sum, item) => {
                return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0)
              }, 0)
            },
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "discount",
            label: "优惠金额",
            type: "amount",
            compute: (data, summary) => {
              const discountRate = Number(data.discountRate) || 0
              return summary.subtotal * (discountRate / 100)
            },
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "freight",
            label: "运费",
            type: "amount",
            compute: (data) => {
              const subtotal = (data.tableData?.orderItems || []).reduce((sum, item) => {
                return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0)
              }, 0)
              // 满100免运费，否则10元运费
              return subtotal >= 100 ? 0 : 10
            },
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "taxableAmount",
            label: "应税金额",
            type: "amount",
            compute: (data, summary) => {
              return summary.subtotal - summary.discount + summary.freight
            },
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "tax",
            label: "税额",
            type: "amount",
            compute: (data, summary) => {
              return summary.taxableAmount * 0.13
            },
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "total",
            label: "订单总额",
            type: "amount",
            compute: (data, summary) => {
              return summary.taxableAmount + summary.tax
            },
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          }
        ]
      },
      {
        key: "statisticsSummary",
        title: "统计汇总",
        icon: "mdi:chart-box",
        description: "自动计算统计数据",
        layout: "grid",
        columns: 4,
        fields: [
          {
            name: "totalQuantity",
            label: "总数量",
            type: "number",
            compute: (data) => {
              return (data.tableData?.orderItems || []).reduce((sum, item) => {
                return sum + (Number(item.quantity) || 0)
              }, 0)
            },
            formatConfig: {
              type: "number",
              useGrouping: true,
              precision: 0
            }
          },
          {
            name: "averagePrice",
            label: "平均单价",
            type: "amount",
            compute: (data, summary) => {
              const totalQuantity = (data.tableData?.orderItems || []).reduce((sum, item) => {
                return sum + (Number(item.quantity) || 0)
              }, 0)
              return totalQuantity ? summary.subtotal / totalQuantity : 0
            },
            formatConfig: {
              type: "currency",
              options: {
                currency: "CNY",
                precision: 2
              }
            }
          },
          {
            name: "discountRate",
            label: "折扣率",
            type: "percentage",
            compute: (data, summary) => {
              return summary.subtotal ? (summary.discount / summary.subtotal) : 0
            },
            formatConfig: {
              type: "percentage",
              precision: 2
            }
          },
          {
            name: "profitRate",
            label: "利润率",
            type: "percentage",
            compute: (data, summary) => {
              const cost = (data.tableData?.orderItems || []).reduce((sum, item) => {
                return sum + (Number(item.quantity) || 0) * (Number(item.cost) || 0)
              }, 0)
              return summary.total ? ((summary.total - cost) / summary.total) : 0
            },
            formatConfig: {
              type: "percentage",
              precision: 2,
              conditions: [
                {
                  condition: value => value >= 0.3,
                  style: { color: "green" }
                },
                {
                  condition: value => value < 0.1,
                  style: { color: "red" }
                }
              ]
            }
          }
        ]
      }
    ]
  }
}
```