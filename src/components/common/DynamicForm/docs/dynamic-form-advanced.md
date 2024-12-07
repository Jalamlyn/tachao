# DynamicForm 高级使用指南

## 表单联动实现指南

### 1. 基本概念

在动态表单中,表单联动主要包含两个部分:

- 表单状态管理: 用于存储和更新表单的值
- 配置对象: 用于定义表单的结构和行为

### 2. 表单状态与配置对象

重要区别:

```mo
// 表单状态 - 可以动态修改
form.setValue("cityOptions", newOptions)

// 配置对象 - 不应该动态修改
form.setValue("renderConfig.basicFields.city.options", newOptions) // ❌ 错误
```

### 3. 动态选项的最佳实践

#### 3.1 定义选项字段

```mo
const config = {
  renderConfig: {
    basicFields: [
      {
        name: "city",
        type: "select",
        // ✅ 使用函数获取动态选项
        options: (form) => form.getValues("cityOptions") || [],
      },
    ],
  },
}
```

#### 3.2 实现联动逻辑

```mo
const config = {
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "province") {
        // 1. 清空依赖字段
        form.setValue("city", "")
        form.setValue("district", "")

        // 2. 获取新选项
        const cityOptions = getCityOptions(value.province)

        // 3. 更新选项到表单状态
        form.setValue("cityOptions", cityOptions)
      }
    })

    return () => subscription.unsubscribe()
  },
}
```

## 计算字段实现指南

### 1. 计算字段基本规则

- 所有计算字段必须通过 watch 函数实现
- 计算字段应设置为只读（editable: false）
- 计算字段的值会随依赖字段变化自动更新

### 2. 表格计算字段

#### 2.1 表格行内计算

```mo
{
  renderConfig: {
    tables: [
      {
        key: "orderDetails",
        config: {
          columns: [
            { key: "quantity", title: "数量", type: "number" },
            { key: "price", title: "单价", type: "number" },
            { 
              key: "amount", 
              title: "金额", 
              type: "number",
              editable: false  // 计算字段设置为只读
            }
          ]
        }
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // ✅ 正确的表格数据路径
      if (name.startsWith('tableData.orderDetails')) {
        const details = form.getValues('tableData.orderDetails') || []
        
        details.forEach((item, index) => {
          const quantity = Number(item.quantity) || 0
          const price = Number(item.price) || 0
          // ✅ 正确的设值路径
          form.setValue(`tableData.orderDetails.${index}.amount`, quantity * price)
        })
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

#### 2.2 表格合计配置

```mo
{
  renderConfig: {
    tables: [
      {
        key: "orderDetails",
        config: {
          columns: [
            { 
              key: "quantity", 
              title: "数量", 
              type: "number",
              // ✅ 列级别的合计配置
              summary: {
                render: (values) => {
                  const details = values?.tableData?.orderDetails || []
                  return details.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
                }
              }
            },
            { 
              key: "amount", 
              title: "金额", 
              type: "number",
              editable: false,
              // ✅ 金额列的合计配置
              summary: {
                render: (values) => {
                  const details = values?.tableData?.orderDetails || []
                  const total = details.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                  return `¥${total.toFixed(2)}`
                }
              }
            }
          ],
          // ✅ 表格级别的合计配置
          summary: {
            show: true,
            label: "合计"
          }
        }
      }
    ]
  }
}
```

### 3. 基础字段计算

```mo
{
  renderConfig: {
    basicFields: [
      { name: "num1", label: "数值1", type: "number" },
      { name: "num2", label: "数值2", type: "number" },
      { 
        name: "total", 
        label: "合计", 
        type: "number",
        disabled: true  // 计算字段设置为禁用
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "num1" || name === "num2") {
        const num1 = Number(form.getValues("num1")) || 0
        const num2 = Number(form.getValues("num2")) || 0
        form.setValue("total", num1 + num2)
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

### 4. 完整示例

```mo
export default {
  title: "销售订单",
  config: {
    metadata: {
      title: "销售订单",
    },
    renderConfig: {
      basicFields: [
        { name: "num1", label: "数值1", type: "number" },
        { name: "num2", label: "数值2", type: "number" },
        { name: "total", label: "合计", type: "number", disabled: true }
      ],
      tables: [
        {
          key: "orderDetails",
          title: "订单明细",
          config: {
            columns: [
              { 
                key: "quantity", 
                title: "数量", 
                type: "number",
                summary: {
                  render: (values) => {
                    const details = values?.tableData?.orderDetails || []
                    return details.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
                  }
                }
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
                editable: false,
                summary: {
                  render: (values) => {
                    const details = values?.tableData?.orderDetails || []
                    return details.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                  }
                }
              }
            ],
            summary: {
              show: true,
              label: "合计"
            }
          }
        }
      ]
    },
    watch: (form) => {
      const subscription = form.watch((value, { name }) => {
        // 基础字段计算
        if (name === "num1" || name === "num2") {
          const num1 = Number(form.getValues("num1")) || 0
          const num2 = Number(form.getValues("num2")) || 0
          form.setValue("total", num1 + num2)
        }

        // 表格行计算
        if (name.startsWith('tableData.orderDetails')) {
          const details = form.getValues('tableData.orderDetails') || []
          details.forEach((item, index) => {
            const quantity = Number(item.quantity) || 0
            const price = Number(item.price) || 0
            form.setValue(`tableData.orderDetails.${index}.amount`, quantity * price)
          })
        }
      })
      return () => subscription.unsubscribe()
    }
  }
}
```

### 5. 注意事项

1. 路径使用规则：
   - 表格数据必须使用 `tableData.表格key` 作为路径
   - 表格行数据使用 `tableData.表格key.行索引.字段key`
   - 基础字段直接使用字段名作为路径

2. watch 使用规则：
   - 使用 startsWith 判断表格字段变化
   - 使用精确匹配判断基础字段变化
   - 必须返回取消订阅函数

3. 计算字段设置：
   - 表格计算列设置 editable: false
   - 基础计算字段设置 disabled: true
   - 合计配置在列级别设置 summary.render