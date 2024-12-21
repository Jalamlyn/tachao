# 自动计算表格

## 基础自动计算
```typescript
{
  key: "computeTable",
  title: "自动计算表格",
  config: {
    columns: [
      {
        key: "quantity",
        title: "数量",
        type: "number"
      },
      {
        key: "price",
        title: "单价",
        type: "number"
      },
      {
        key: "amount",
        title: "金额",
        type: "number",
        disabled: true
      }
    ]
  },
  watch: (form) => {
    form.watch((value, { name }) => {
      if (name?.includes("quantity") || name?.includes("price")) {
        const quantity = Number(value.quantity) || 0
        const price = Number(value.price) || 0
        form.setValue("amount", quantity * price)
      }
    })
  }
}
```
基础的表格计算功能。

## 复杂计算表格
```typescript
{
  key: "complexComputeTable",
  title: "复杂计算表格",
  config: {
    columns: [
      {
        key: "baseAmount",
        title: "基础金额",
        type: "number"
      },
      {
        key: "taxRate",
        title: "税率",
        type: "number"
      },
      {
        key: "taxAmount",
        title: "税额",
        type: "number",
        disabled: true
      },
      {
        key: "totalAmount",
        title: "总金额",
        type: "number",
        disabled: true
      }
    ]
  }
}
```
支持复杂的计算逻辑。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "自动计算表格示例"
  },
  renderConfig: {
    tables: [
      {
        key: "orderTable",
        title: "订单明细",
        description: "自动计算订单金额",
        config: {
          columns: [
            {
              key: "product",
              title: "产品",
              type: "text",
              width: 200,
              required: true
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: 100,
              required: true,
              min: 1
            },
            {
              key: "price",
              title: "单价",
              type: "number",
              width: 150,
              required: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            },
            {
              key: "baseAmount",
              title: "基础金额",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            },
            {
              key: "discountRate",
              title: "折扣率",
              type: "number",
              width: 100,
              min: 0,
              max: 100,
              formatConfig: {
                type: "percentage",
                precision: 2
              }
            },
            {
              key: "discountAmount",
              title: "折扣金额",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            },
            {
              key: "taxRate",
              title: "税率",
              type: "number",
              width: 100,
              formatConfig: {
                type: "percentage",
                precision: 2
              }
            },
            {
              key: "taxAmount",
              title: "税额",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            },
            {
              key: "totalAmount",
              title: "总金额",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2
                }
              }
            }
          ],
          summary: {
            show: true,
            firstColumnText: "合计",
            onCompute: (data) => {
              const total = data.reduce((sum, row) => {
                return {
                  baseAmount: sum.baseAmount + (Number(row.baseAmount) || 0),
                  discountAmount: sum.discountAmount + (Number(row.discountAmount) || 0),
                  taxAmount: sum.taxAmount + (Number(row.taxAmount) || 0),
                  totalAmount: sum.totalAmount + (Number(row.totalAmount) || 0)
                }
              }, { baseAmount: 0, discountAmount: 0, taxAmount: 0, totalAmount: 0 })

              return {
                baseAmount: total.baseAmount.toFixed(2),
                discountAmount: total.discountAmount.toFixed(2),
                taxAmount: total.taxAmount.toFixed(2),
                totalAmount: total.totalAmount.toFixed(2)
              }
            }
          }
        }
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("tableData.orderTable")) return

      const tableData = form.getValues("tableData.orderTable") || []
      tableData.forEach((row, index) => {
        // 计算基础金额
        const quantity = Number(row.quantity) || 0
        const price = Number(row.price) || 0
        const baseAmount = quantity * price
        form.setValue(`tableData.orderTable.${index}.baseAmount`, baseAmount.toFixed(2))

        // 计算折扣金额
        const discountRate = Number(row.discountRate) || 0
        const discountAmount = baseAmount * (discountRate / 100)
        form.setValue(`tableData.orderTable.${index}.discountAmount`, discountAmount.toFixed(2))

        // 计算税额
        const taxRate = Number(row.taxRate) || 0
        const taxableAmount = baseAmount - discountAmount
        const taxAmount = taxableAmount * (taxRate / 100)
        form.setValue(`tableData.orderTable.${index}.taxAmount`, taxAmount.toFixed(2))

        // 计算总金额
        const totalAmount = taxableAmount + taxAmount
        form.setValue(`tableData.orderTable.${index}.totalAmount`, totalAmount.toFixed(2))
      })
    })

    return () => subscription.unsubscribe()
  }
}
```