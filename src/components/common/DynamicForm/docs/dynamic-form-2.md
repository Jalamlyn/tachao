#### 5. 流程确认配置

```typescript
{
  renderConfig: {
    processSteps: [
      {
        key: "submit",
        title: "提交",
        icon: "mdi:send",
        weight: 1,
        fields: [
          {
            name: "comment",
            label: "备注",
            type: "textarea",
            className: "min-h-[100px]",
          },
        ],
      },
      {
        key: "approve",
        title: "审批",
        icon: "mdi:check",
        weight: 2,
        fields: [
          {
            name: "approvalComment",
            label: "审批意见",
            type: "textarea",
            required: true,
          },
          {
            name: "approvalSignature",
            label: "审批签名",
            type: "signature",
            required: true,
            width: 300,
            height: 150,
          },
        ],
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
        approvers: {
          type: "single",
          roles: ["manager"],
          minApprovers: 1,
          maxApprovers: 1,
          deadline: 24 * 60 * 60 * 1000, // 24小时
          notifyType: "email",
          escalation: {
            after: 4 * 60 * 60 * 1000, // 4小时后升级
            to: ["director"],
          },
        },
        timeout: {
          duration: 48 * 60 * 60 * 1000, // 48小时
          action: "auto-reject",
          message: "审批超时自动拒绝",
          callback: (step) => {
            console.log(`Step ${step} timeout`)
          },
        },
      },
    ]
  }
}
```

### 事件处理和验证

```typescript
{
  eventHandlers: {
    onSubmit: async (validationResult, values) => {
      if (validationResult.valid) {
        await saveForm(values)
      }
    },
    onChange: (values) => {
      console.log("Form values changed:", values)
    },
    onError: (error) => {
      console.error("Form error:", error)
    }
  },
  validate: async (values, context) => {
    const errors: string[] = []

    if (context?.mode === "create") {
      // 创建模式特定验证
      if (!values.orderDate) {
        errors.push("订单日期必填")
      }
    }

    // 自定义业务规则验证
    if (values.endDate && values.startDate && new Date(values.endDate) < new Date(values.startDate)) {
      errors.push("结束日期不能早于开始日期")
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
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

### 样式配置

DynamicForm组件支持多层次的样式定制：

1. 组件级样式：

```typescript
{
  className: string
  style: React.CSSProperties
}
```

2. 字段级样式：

```typescript
{
  name: "customField",
  className: "w-full p-4 rounded-lg",
  style: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb"
  }
}
```

3. 分组级样式：

```typescript
{
  key: "group1",
  className: "space-y-6 bg-white p-6 rounded-xl shadow-sm",
  style: {
    borderLeft: "4px solid #3b82f6"
  }
}
```

4. 表格级样式：

```typescript
{
  columns: [
    {
      key: "amount",
      className: "text-right font-mono",
      style: {
        backgroundColor: "#f3f4f6"
      }
    }
  ],
  summary: {
    className: "bg-blue-50 font-bold",
    style: {
      borderTop: "2px solid #3b82f6"
    }
  }
}
```
