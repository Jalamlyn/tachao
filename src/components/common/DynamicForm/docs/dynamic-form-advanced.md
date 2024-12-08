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
        extraFields.forEach(field => {
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
        fields.forEach(field => {
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

    const subscription = form.watch((value,{ name }) => {
      if (!isCalculating && name.startsWith('tableData.orderDetails') && 
          (name.includes('.quantity') || name.includes('.price'))) {
        isCalculating = true
        try {
          const details = form.getValues('tableData.orderDetails') || []
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

## 流程控制系统

### 1. 步骤依赖配置
```typescript
{
  processSteps: [
    {
      key: "submit",
      title: "提交",
      fields: [
        {
          name: "comment",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      key: "review",
      title: "审核",
      dependencies: [
        {
          step: "submit",
          condition: {
            field: "comment",
            value: true
          },
          message: "请先完成提交步骤"
        }
      ],
      fields: [
        {
          name: "reviewComment",
          type: "textarea",
          required: true
        }
      ]
    }
  ]
}
```

### 2. 超时处理
```typescript
{
  processSteps: [
    {
      key: "approve",
      title: "审批",
      timeout: {
        duration: 24 * 60 * 60 * 1000, // 24小时
        action: "auto-reject",
        message: "审批超时自动拒绝",
        callback: (step) => {
          console.log(`Step ${step} timeout`)
        }
      }
    }
  ]
}
```

### 3. 审批人配置
```typescript
{
  processSteps: [
    {
      key: "approve",
      title: "审批",
      approvers: {
        type: "multiple",
        roles: ["manager", "director"],
        minApprovers: 2,
        maxApprovers: 3,
        deadline: 48 * 60 * 60 * 1000,
        notifyType: "email",
        escalation: {
          after: 24 * 60 * 60 * 1000,
          to: ["vp"]
        }
      }
    }
  ]
}
```

## 验证系统

### 1. 字段级验证
```typescript
{
  fields: [
    {
      name: "email",
      type: "email",
      validators: [
        (value) => {
          if (!value) return undefined
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
            ? undefined 
            : "请输入有效的邮箱地址"
        }
      ]
    }
  ]
}
```

### 2. 表单级验证
```typescript
{
  validate: async (values, context) => {
    const errors: string[] = []
    
    // 业务规则验证
    if (values.endDate && values.startDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        errors.push("结束日期不能早于开始日期")
      }
    }

    // 复杂依赖验证
    if (values.type === "special" && !values.specialReason) {
      errors.push("特殊类型必须填写原因")
    }

    return {
      valid: errors.length === 0,
      errors,
      fields: {},
      categorizedErrors: {
        required: [],
        invalid: [],
        other: errors.map(error => ({
          field: "form",
          message: error
        }))
      }
    }
  }
}
```

### 3. 异步验证
```typescript
{
  fields: [
    {
      name: "username",
      type: "text",
      validators: [
        async (value) => {
          if (!value) return undefined
          try {
            const exists = await checkUsernameExists(value)
            return exists ? "用户名已存在" : undefined
          } catch (error) {
            return "验证失败，请重试"
          }
        }
      ]
    }
  ]
}
```

### 3. 条件渲染
```typescript
{
  fields: [
    {
      name: "extraInfo",
      type: "custom",
      render: ({ field, form, isEditable }) => {
        if (!isEditable) return null
        
        return useMemo(() => (
          <ComplexComponent {...field} />
        ), [field.value])
      }
    }
  ]
}
```