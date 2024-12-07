# DynamicForm 表单联动

## 表单联动概述

表单联动是指表单中字段之间的依赖关系，当某个字段的值发生变化时，需要联动更新其他字段的状态或值。

## 实现方式

### 1. watch 函数

```typescript
watch: (form) => {
  let isCalculating = false // 防递归标志位

  const subscription = form.watch((value, { name }) => {
    if (!isCalculating && name === "triggerField") {
      isCalculating = true
      try {
        // 执行联动逻辑
        form.setValue("targetField", newValue)
      } finally {
        isCalculating = false
      }
    }
  })

  return () => subscription.unsubscribe()
}
```

### 2. 字段依赖配置

```typescript
{
  name: "city",
  label: "城市",
  type: "select",
  options: (form) => {
    const province = form.getValues("province")
    return getCityOptions(province)
  }
}
```

## 联动场景

### 1. 级联选择

```typescript
{
  renderConfig: {
    basicFields: [
      {
        name: "province",
        label: "省份",
        type: "select",
        options: provinces
      },
      {
        name: "city",
        label: "城市",
        type: "select",
        options: (form) => {
          const province = form.getValues("province")
          return getCityOptions(province)
        }
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "province") {
        form.setValue("city", "") // 清空依赖字段
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

### 2. 计算字段

```typescript
{
  renderConfig: {
    basicFields: [
      {
        name: "quantity",
        label: "数量",
        type: "number"
      },
      {
        name: "price",
        label: "单价",
        type: "number"
      },
      {
        name: "amount",
        label: "金额",
        type: "number",
        disabled: true
      }
    ]
  },
  watch: (form) => {
    let isCalculating = false

    const subscription = form.watch((value, { name }) => {
      if (!isCalculating && (name === "quantity" || name === "price")) {
        isCalculating = true
        try {
          const quantity = Number(form.getValues("quantity")) || 0
          const price = Number(form.getValues("price")) || 0
          const newAmount = quantity * price

          const currentAmount = Number(form.getValues("amount")) || 0
          if (currentAmount !== newAmount) {
            form.setValue("amount", newAmount)
          }
        } finally {
          isCalculating = false
        }
      }
    })

    return () => subscription.unsubscribe()
  }
}
```

### 3. 表格计算

```typescript
{
  renderConfig: {
    tables: [
      {
        key: "details",
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
              editable: false
            }
          ]
        }
      }
    ]
  },
  watch: (form) => {
    let isCalculating = false

    const subscription = form.watch((value, { name }) => {
      if (!isCalculating && 
          name.startsWith("tableData.details") && 
          (name.includes(".quantity") || name.includes(".price"))) {
        isCalculating = true
        try {
          const details = form.getValues("tableData.details") || []
          let totalAmount = 0

          details.forEach((item, index) => {
            const quantity = Number(item.quantity) || 0
            const price = Number(item.price) || 0
            const newAmount = quantity * price

            const currentAmount = Number(item.amount) || 0
            if (currentAmount !== newAmount) {
              form.setValue(`tableData.details.${index}.amount`, newAmount)
            }
            totalAmount += newAmount
          })

          // 更新总金额
          const currentTotal = Number(form.getValues("totalAmount")) || 0
          if (currentTotal !== totalAmount) {
            form.setValue("totalAmount", totalAmount)
          }
        } finally {
          isCalculating = false
        }
      }
    })

    return () => subscription.unsubscribe()
  }
}
```

### 4. 条件显示

```typescript
{
  renderConfig: {
    basicFields: [
      {
        name: "needInvoice",
        label: "是否需要发票",
        type: "switch"
      },
      {
        name: "invoiceType",
        label: "发票类型",
        type: "select",
        options: [
          { label: "增值税专用发票", value: "special" },
          { label: "增值税普通发票", value: "normal" }
        ],
        showWhen: (values) => values.needInvoice
      }
    ]
  }
}
```

## 性能优化

### 1. 使用标志位避免递归

```typescript
let isCalculating = false

const subscription = form.watch((value, { name }) => {
  if (!isCalculating) {
    isCalculating = true
    try {
      // 执行计算
    } finally {
      isCalculating = false
    }
  }
})
```

### 2. 只监听必要字段

```typescript
// ❌ 错误示例：监听所有字段变化
form.watch((value) => {
  // 执行计算
})

// ✅ 正确示例：只监听特定字段
form.watch((value, { name }) => {
  if (name === "targetField") {
    // 执行计算
  }
})
```

### 3. 比较值是否变化

```typescript
const currentValue = form.getValues("targetField")
if (currentValue !== newValue) {
  form.setValue("targetField", newValue)
}
```

## 最佳实践

### 1. 防递归检查清单

```typescript
□ 是否添加了防递归标志位？
□ 是否只监听必要的字段？
□ 是否进行了值比较？
□ 是否正确处理了异常情况？
□ 是否正确清理了订阅？
```

### 2. 路径使用规则

```typescript
// 表格数据路径
"tableData.表格key.行索引.字段key"

// 基础字段路径
"字段名"
```

### 3. 错误处理

```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    try {
      // 执行联动逻辑
    } catch (error) {
      console.error("联动计算错误:", error)
      // 可以显示错误提示
    }
  })
  return () => subscription.unsubscribe()
}
```

## 相关文档

- [配置详解](../basic/configuration.md)
- [表格特性](./table-features.md)
- [完整示例](../examples/complex-forms.md)