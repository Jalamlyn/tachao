# DynamicForm 高级特性文档

本文档采用结构化格式，专门针对AI模型理解和处理DynamicForm的高级特性。

## 表单联动系统

### 1. 状态管理架构

```typescript
interface FormState {
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  errors: Record<string, string>
}

interface FormEventHandlers {
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  onChange?: (values: any) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}
```

### 2. 联动实现方式

#### 2.1 值联动

```typescript
{
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "province") {
        // 清空依赖字段
        form.setValue("city", "")
        form.setValue("district", "")

        // 更新选项
        const cityOptions = getCityOptions(value.province)
        form.setValue("cityOptions", cityOptions)
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

#### 2.2 显示联动

```typescript
{
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "needExtra") {
        const extraFields = form.getValues("extraFields") || []
        extraFields.forEach((field) => {
          form.setValue(`${field}.hidden`, !value.needExtra)
        })
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

#### 2.3 验证联动

```typescript
{
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "type") {
        const fields = getTypeFields(value.type)
        fields.forEach((field) => {
          form.setValue(`${field}.required`, true)
        })
        form.trigger(fields)
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

## 计算字段系统

### 1. 基础字段计算

```typescript
{
  watch: (form) => {
    let isCalculating = false

    const subscription = form.watch((value, { name }) => {
      if (!isCalculating && (name === "num1" || name === "num2")) {
        isCalculating = true
        try {
          const num1 = Number(form.getValues("num1")) || 0
          const num2 = Number(form.getValues("num2")) || 0
          const newTotal = num1 + num2

          const currentTotal = Number(form.getValues("total")) || 0
          if (currentTotal !== newTotal) {
            form.setValue("total", newTotal)
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

### 2. 表格计算

#### 2.1 行内计算

```typescript
{
  watch: (form) => {
    let isCalculating = false

    const subscription = form.watch((value, { name }) => {
      if (
        !isCalculating &&
        name.startsWith("tableData.orderDetails") &&
        (name.includes(".quantity") || name.includes(".price"))
      ) {
        isCalculating = true
        try {
          const details = form.getValues("tableData.orderDetails") || []
          details.forEach((item, index) => {
            const quantity = Number(item.quantity) || 0
            const price = Number(item.price) || 0
            const newAmount = quantity * price

            const currentAmount = Number(item.amount) || 0
            if (currentAmount !== newAmount) {
              form.setValue(`tableData.orderDetails.${index}.amount`, newAmount)
            }
          })
        } finally {
          isCalculating = false
        }
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

#### 2.2 表格合计

```typescript
{
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
      key: "amount",
      title: "金额",
      type: "number",
      editable: false,
      summary: {
        render: (values) => {
          const details = values?.tableData?.orderDetails || []
          const total = details.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
          return `¥${total.toFixed(2)}`
        }
      }
    }
  ],
  summary: {
    show: true,
    label: "合计",
    className: "bg-gray-50 font-bold"
  }
}
```
