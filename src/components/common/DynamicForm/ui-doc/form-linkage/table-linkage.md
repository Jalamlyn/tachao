# 表格联动

## 基础表格联动
```typescript
{
  tables: [
    {
      key: "orderItems",
      title: "订单明细",
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
      }
    }
  ],
  watch: (form) => {
    form.watch((value, { name }) => {
      if (name?.includes("quantity") || name?.includes("price")) {
        const tableData = form.getValues("tableData.orderItems") || []
        tableData.forEach((row, index) => {
          const amount = (row.quantity || 0) * (row.price || 0)
          form.setValue(`tableData.orderItems.${index}.amount`, amount)
        })
      }
    })
  }
}
```
基础的表格计算联动。

## 跨表格联动
```typescript
{
  tables: [
    {
      key: "mainTable",
      title: "主表",
      config: {
        columns: [
          {
            key: "type",
            title: "类型",
            type: "select",
            options: [
              { label: "类型A", value: "A" },
              { label: "类型B", value: "B" }
            ]
          }
        ]
      }
    },
    {
      key: "subTable",
      title: "子表",
      config: {
        columns: [
          {
            key: "category",
            title: "分类",
            type: "select",
            options: (form) => {
              const mainType = form.getValues("tableData.mainTable[0].type")
              return mainType === "A" 
                ? [{ label: "A-1", value: "a1" }, { label: "A-2", value: "a2" }]
                : [{ label: "B-1", value: "b1" }, { label: "B-2", value: "b2" }]
            }
          }
        ]
      }
    }
  ]
}
```
支持表格间的联动。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "表格联动示例"
  },
  renderConfig: {
    tables: [
      {
        key: "products",
        title: "产品清单",
        description: "选择产品并填写数量",
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
                  { key: "code", label: "产品编码" }
                ],
                fieldMapping: {
                  "price": "price",
                  "unit": "unit"
                }
              }
            },
            {
              key: "unit",
              title: "单位",
              type: "text",
              width: 100,
              disabled: true
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
              key: "discount",
              title: "折扣率",
              type: "number",
              width: 100,
              min: 0,
              max: 100,
              formatConfig: {
                type: "percentage",
                precision: 0
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
              const total = data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
              return {
                amount: total.toFixed(2)
              }
            }
          }
        }
      },
      {
        key: "deliveryPlan",
        title: "发货计划",
        description: "根据产品清单自动生成发货计划",
        config: {
          columns: [
            {
              key: "product",
              title: "产品",
              type: "text",
              width: 200,
              disabled: true
            },
            {
              key: "planQuantity",
              title: "计划数量",
              type: "number",
              width: 100,
              required: true
            },
            {
              key: "remainQuantity",
              title: "剩余数量",
              type: "number",
              width: 100,
              disabled: true
            },
            {
              key: "deliveryDate",
              title: "发货日期",
              type: "date",
              width: 150,
              required: true
            },
            {
              key: "status",
              title: "状态",
              type: "select",
              width: 100,
              options: [
                { label: "待发货", value: "pending" },
                { label: "已发货", value: "shipped" }
              ]
            }
          ]
        }
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 产品清单计算
      if (name?.startsWith("tableData.products")) {
        const productsData = form.getValues("tableData.products") || []
        productsData.forEach((row, index) => {
          if (!row) return
          
          // 计算金额
          const quantity = Number(row.quantity) || 0
          const price = Number(row.price) || 0
          const discount = Number(row.discount) || 100
          const amount = quantity * price * (discount / 100)
          form.setValue(`tableData.products.${index}.amount`, amount.toFixed(2))
          
          // 更新发货计划
          const deliveryPlanData = form.getValues("tableData.deliveryPlan") || []
          const existingPlan = deliveryPlanData.find(plan => 
            plan.product === row.product?.name && plan.status === "pending"
          )
          
          if (!existingPlan && quantity > 0) {
            // 添加新的发货计划
            const newPlan = {
              product: row.product?.name,
              planQuantity: quantity,
              remainQuantity: quantity,
              status: "pending"
            }
            const newDeliveryPlanData = [...deliveryPlanData, newPlan]
            form.setValue("tableData.deliveryPlan", newDeliveryPlanData)
          } else if (existingPlan) {
            // 更新现有计划
            const planIndex = deliveryPlanData.indexOf(existingPlan)
            form.setValue(`tableData.deliveryPlan.${planIndex}.planQuantity`, quantity)
            form.setValue(`tableData.deliveryPlan.${planIndex}.remainQuantity`, quantity)
          }
        })
      }
      
      // 发货计划状态联动
      if (name?.includes("deliveryPlan") && name?.includes("status")) {
        const deliveryPlanData = form.getValues("tableData.deliveryPlan") || []
        deliveryPlanData.forEach((plan, index) => {
          if (plan.status === "shipped") {
            form.setValue(`tableData.deliveryPlan.${index}.remainQuantity`, 0)
          }
        })
      }
    })

    return () => subscription.unsubscribe()
  }
}
```