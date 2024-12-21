# 汇总统计表格

## 基础汇总

```typescript
{
  key: "summaryTable",
  title: "基础汇总表格",
  config: {
    columns: [
      {
        key: "name",
        title: "名称",
        type: "text"
      },
      {
        key: "amount",
        title: "金额",
        type: "number"
      }
    ],
    summary: {
      show: true,
      firstColumnText: "合计",
    }
  }
}
```

基础的表格汇总功能。

## 多列汇总

```typescript
{
  key: "multiSummaryTable",
  title: "多列汇总表格",
  config: {
    columns: [
      {
        key: "name",
        title: "名称",
        type: "text"
      },
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
        type: "number"
      }
    ],
    summary: {
      show: true,
      firstColumnText: "合计",
    }
  }
}
```

支持多列数据汇总。

## 完整示例

```typescript
const formConfig = {
  metadata: {
    title: "汇总统计表格示例",
  },
  renderConfig: {
    tables: [
      {
        key: "salesTable",
        title: "销售统计表",
        description: "统计销售数据",
        config: {
          columns: [
            {
              key: "category",
              title: "类别",
              type: "text",
              width: 150,
              required: true,
            },
            {
              key: "product",
              title: "产品",
              type: "text",
              width: 200,
              required: true,
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: 100,
              required: true,
              formatConfig: {
                type: "number",
                precision: 0,
              },
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
                  precision: 2,
                },
              },
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2,
                },
              },
            },
            {
              key: "cost",
              title: "成本",
              type: "number",
              width: 150,
              required: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2,
                },
              },
            },
            {
              key: "profit",
              title: "利润",
              type: "number",
              width: 150,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2,
                  conditions: [
                    {
                      condition: (value) => value > 0,
                      style: { color: "green" },
                    },
                    {
                      condition: (value) => value < 0,
                      style: { color: "red" },
                    },
                  ],
                },
              },
            },
          ],
          summary: {
            show: true,
            firstColumnText: "合计",
          },
        },
      },
    ],
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (!name?.startsWith("tableData.salesTable")) return

      const tableData = form.getValues("tableData.salesTable") || []
      tableData.forEach((row, index) => {
        // 计算金额
        const quantity = Number(row.quantity) || 0
        const price = Number(row.price) || 0
        const amount = quantity * price
        form.setValue(`tableData.salesTable.${index}.amount`, amount.toFixed(2))

        // 计算利润
        const cost = Number(row.cost) || 0
        const profit = amount - cost
        form.setValue(`tableData.salesTable.${index}.profit`, profit.toFixed(2))
      })
    })

    return () => subscription.unsubscribe()
  },
}
```
