# 汇总联动

## 基础汇总联动
```typescript
{
  tables: [
    {
      key: "items",
      config: {
        columns: [
          {
            key: "amount",
            title: "金额",
            type: "number"
          }
        ]
      }
    }
  ],
  summaryGroups: [
    {
      key: "totalSummary",
      fields: [
        {
          name: "total",
          label: "总计",
          type: "amount",
          compute: (data) => {
            return (data.tableData?.items || [])
              .reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
          }
        }
      ]
    }
  ]
}
```
基础的表格与汇总联动。

## 复杂汇总联动
```typescript
{
  tables: [
    {
      key: "sales",
      config: {
        columns: [
          {
            key: "amount",
            title: "销售额",
            type: "number"
          },
          {
            key: "cost",
            title: "成本",
            type: "number"
          }
        ]
      }
    }
  ],
  summaryGroups: [
    {
      key: "profitSummary",
      fields: [
        {
          name: "totalSales",
          label: "总销售额",
          type: "amount",
          compute: (data) => {
            return (data.tableData?.sales || [])
              .reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
          }
        },
        {
          name: "totalCost",
          label: "总成本",
          type: "amount",
          compute: (data) => {
            return (data.tableData?.sales || [])
              .reduce((sum, row) => sum + (Number(row.cost) || 0), 0)
          }
        },
        {
          name: "profit",
          label: "利润",
          type: "amount",
          compute: (data, summary) => {
            return summary.totalSales - summary.totalCost
          }
        }
      ]
    }
  ]
}
```
支持复杂的汇总计算。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "汇总联动示例"
  },
  renderConfig: {
    tables: [
      {
        key: "salesData",
        title: "销售数据",
        description: "记录销售明细",
        config: {
          columns: [
            {
              key: "product",
              title: "产品",
              type: "resource",
              width: 200,
              required: true,
              resourceConfig: {
                resourceId: "products",
                displayFields: [
                  { key: "name", label: "产品名称" },
                  { key: "category", label: "类别" }
                ],
                fieldMapping: {
                  "cost": "cost",
                  "price": "price"
                }
              }
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: 100,
              required: true
            },
            {
              key: "price",
              title: "单价",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 }
              }
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 }
              }
            },
            {
              key: "cost",
              title: "成本",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 }
              }
            },
            {
              key: "profit",
              title: "利润",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 }
              }
            }
          ]
        }
      }
    ],
    summaryGroups: [
      {
        key: "salesSummary",
        title: "销售汇总",
        icon: "mdi:calculator",
        description: "销售数据汇总统计",
        layout: "grid",
        columns: 3,
        fields: [
          {
            name: "totalQuantity",
            label: "总数量",
            type: "number",
            compute: (data) => {
              return (data.tableData?.salesData || [])
                .reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
            },
            formatConfig: {
              type: "number",
              useGrouping: true,
              precision: 0
            }
          },
          {
            name: "totalAmount",
            label: "总金额",
            type: "amount",
            compute: (data) => {
              return (data.tableData?.salesData || [])
                .reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
            },
            formatConfig: {
              type: "currency",
              options: { currency: "CNY", precision: 2 }
            }
          },
          {
            name: "totalCost",
            label: "总成本",
            type: "amount",
            compute: (data) => {
              return (data.tableData?.salesData || [])
                .reduce((sum, row) => sum + (Number(row.cost) || 0), 0)
            },
            formatConfig: {
              type: "currency",
              options: { currency: "CNY", precision: 2 }
            }
          },
          {
            name: "totalProfit",
            label: "总利润",
            type: "amount",
            compute: (data, summary) => {
              return summary.totalAmount - summary.totalCost
            },
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
            name: "profitRate",
            label: "利润率",
            type: "percentage",
            compute: (data, summary) => {
              return summary.totalAmount ? summary.totalProfit / summary.totalAmount : 0
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
          },
          {
            name: "averageAmount",
            label: "平均单价",
            type: "amount",
            compute: (data, summary) => {
              return summary.totalQuantity ? summary.totalAmount / summary.totalQuantity : 0
            },
            formatConfig: {
              type: "currency",
              options: { currency: "CNY", precision: 2 }
            }
          }
        ]
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("tableData.salesData")) {
        const salesData = form.getValues("tableData.salesData") || []
        salesData.forEach((row, index) => {
          if (!row) return
          
          // 计算金额
          const quantity = Number(row.quantity) || 0
          const price = Number(row.price) || 0
          const amount = quantity * price
          form.setValue(`tableData.salesData.${index}.amount`, amount.toFixed(2))
          
          // 计算成本
          const cost = quantity * (Number(row.cost) || 0)
          form.setValue(`tableData.salesData.${index}.cost`, cost.toFixed(2))
          
          // 计算利润
          const profit = amount - cost
          form.setValue(`tableData.salesData.${index}.profit`, profit.toFixed(2))
        })
      }
    })

    return () => subscription.unsubscribe()
  }
}
```