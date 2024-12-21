# 基础表格

## 简单表格

```typescript
{
  key: "basicTable",
  title: "基础表格",
  config: {
    columns: [
      {
        key: "name",
        title: "名称",
        type: "text",
        width: 200,
        required: true
      },
      {
        key: "age",
        title: "年龄",
        type: "number",
        width: 100
      }
    ]
  }
}
```

最基本的表格配置。

## 带汇总的表格

```typescript
{
  key: "summaryTable",
  title: "带汇总的表格",
  config: {
    columns: [
      {
        key: "item",
        title: "项目",
        type: "text",
        width: 200
      },
      {
        key: "amount",
        title: "金额",
        type: "number",
        width: 150,
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
    }
  }
}
```

支持表格数据汇总。

## 完整示例

```typescript
const formConfig = {
  metadata: {
    title: "基础表格示例",
  },
  renderConfig: {
    tables: [
      {
        key: "productTable",
        title: "产品清单",
        description: "请填写产品信息",
        config: {
          columns: [
            {
              key: "serialNumber",
              title: "序号",
              type: "number",
              width: 80,
              required: true,
            },
            {
              key: "name",
              title: "产品名称",
              type: "text",
              width: 200,
              required: true,
            },
            {
              key: "specification",
              title: "规格",
              type: "text",
              width: 150,
            },
            {
              key: "unit",
              title: "单位",
              type: "select",
              width: 100,
              options: [
                { label: "个", value: "piece" },
                { label: "箱", value: "box" },
                { label: "kg", value: "kg" },
              ],
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: 100,
              required: true,
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
    // 监听数量和单价变化,自动计算金额
    const subscription = form.watch((value, { name }) => {
      if (name?.includes("quantity") || name?.includes("price")) {
        const tableData = form.getValues("tableData.productTable") || []
        tableData.forEach((row, index) => {
          const quantity = Number(row.quantity) || 0
          const price = Number(row.price) || 0
          const amount = quantity * price
          form.setValue(`tableData.productTable.${index}.amount`, amount.toFixed(2))
        })
      }
    })
    return () => subscription.unsubscribe()
  },
}
```
