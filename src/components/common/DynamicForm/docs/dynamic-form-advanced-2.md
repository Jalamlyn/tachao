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
          required: true,
        },
      ],
    },
    {
      key: "review",
      title: "审核",
      dependencies: [
        {
          step: "submit",
          condition: {
            field: "comment",
            value: true,
          },
          message: "请先完成提交步骤",
        },
      ],
      fields: [
        {
          name: "reviewComment",
          type: "textarea",
          required: true,
        },
      ],
    },
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
        },
      },
    },
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
          to: ["vp"],
        },
      },
    },
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
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "请输入有效的邮箱地址"
        },
      ],
    },
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
        other: errors.map((error) => ({
          field: "form",
          message: error,
        })),
      },
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
        },
      ],
    },
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
