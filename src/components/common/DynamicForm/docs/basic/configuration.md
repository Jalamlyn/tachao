# DynamicForm 配置详解

## 配置对象结构

```typescript
interface DynamicFormConfig {
  metadata: FormMetadata
  renderConfig: FormRenderConfig
  orderNumberConfig?: OrderNumberConfig
  watch?: (form: UseFormReturn<any>) => () => void
  validate?: (values: any) => Promise<ValidationResult>
}
```

## 1. 元数据配置 (metadata)

```typescript
interface FormMetadata {
  title: string                 // 表单标题
  description?: string         // 表单描述
  permissions?: {              // 权限配置
    edit?: boolean            // 是否可编辑
    delete?: boolean         // 是否可删除
    print?: boolean          // 是否可打印
  }
}
```

示例：
```typescript
metadata: {
  title: "销售订单",
  description: "用于记录销售订单信息",
  permissions: {
    edit: true,
    delete: true,
    print: true
  }
}
```

## 2. 渲染配置 (renderConfig)

### 2.1 基础字段配置

```typescript
renderConfig: {
  basicFields: [
    {
      name: "field1",
      label: "字段1",
      type: "text",
      required: true
    }
  ]
}
```

### 2.2 分组字段配置

```typescript
renderConfig: {
  basicFields: {
    groups: [
      {
        key: "group1",
        title: "分组1",
        icon: "mdi:group",
        fields: [
          {
            name: "field1",
            label: "字段1",
            type: "text"
          }
        ]
      }
    ]
  }
}
```

### 2.3 表格配置

```typescript
renderConfig: {
  tables: [
    {
      key: "details",
      title: "明细表格",
      config: {
        columns: [
          {
            key: "name",
            title: "名称",
            type: "text",
            width: 200
          }
        ],
        summary: {
          show: true,
          label: "合计"
        }
      }
    }
  ]
}
```

### 2.4 流程步骤配置

```typescript
renderConfig: {
  processSteps: [
    {
      key: "step1",
      title: "步骤1",
      icon: "mdi:step",
      fields: [
        {
          name: "comment",
          label: "备注",
          type: "textarea"
        }
      ]
    }
  ]
}
```

## 3. 单号配置 (orderNumberConfig)

```typescript
orderNumberConfig: {
  prefix: "SO",              // 单号前缀
  fieldName: "orderNumber",  // 字段名
  label: "订单编号"          // 显示标签
}
```

## 4. 表单联动 (watch)

```typescript
watch: (form) => {
  let isCalculating = false
  
  const subscription = form.watch((value, { name }) => {
    if (!isCalculating && name === "targetField") {
      isCalculating = true
      try {
        // 执行联动逻辑
        form.setValue("dependentField", newValue)
      } finally {
        isCalculating = false
      }
    }
  })

  return () => subscription.unsubscribe()
}
```

## 5. 表单验证 (validate)

```typescript
validate: async (values) => {
  const errors = []
  
  // 执行验证逻辑
  if (!values.requiredField) {
    errors.push("必填字段不能为空")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

## 完整配置示例

```typescript
const config: DynamicFormConfig = {
  metadata: {
    title: "销售订单",
    description: "用于记录销售订单信息",
    permissions: {
      edit: true,
      delete: true,
      print: true
    }
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
          fields: [
            {
              name: "orderDate",
              label: "订单日期",
              type: "date",
              required: true
            }
          ]
        }
      ]
    },
    tables: [
      {
        key: "details",
        title: "订单明细",
        config: {
          columns: [
            {
              key: "productName",
              title: "产品名称",
              type: "text",
              required: true
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              required: true
            }
          ],
          summary: {
            show: true,
            label: "合计"
          }
        }
      }
    ],
    processSteps: [
      {
        key: "submit",
        title: "提交",
        icon: "mdi:send",
        fields: [
          {
            name: "comment",
            label: "备注",
            type: "textarea"
          }
        ]
      }
    ]
  },
  orderNumberConfig: {
    prefix: "SO",
    fieldName: "orderNumber",
    label: "订单编号"
  },
  watch: (form) => {
    let isCalculating = false
    const subscription = form.watch((value, { name }) => {
      if (!isCalculating && name.includes("quantity")) {
        isCalculating = true
        try {
          // 计算总数
          const details = form.getValues("tableData.details") || []
          const total = details.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
          form.setValue("total", total)
        } finally {
          isCalculating = false
        }
      }
    })
    return () => subscription.unsubscribe()
  },
  validate: async (values) => {
    const errors = []
    if (!values.orderDate) {
      errors.push("订单日期不能为空")
    }
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```

## 注意事项

1. 字段命名规范
- 使用驼峰命名
- 避免特殊字符
- 保持语义化

2. 表单联动注意事项
- 使用标志位防止递归
- 及时清理订阅
- 优化性能

3. 验证规则建议
- 统一错误信息格式
- 适当使用异步验证
- 注意验证时序

## 相关文档

- [字段类型](./field-types.md)
- [表单联动](../advanced/form-linkage.md)
- [表格特性](../advanced/table-features.md)
- [流程步骤](../advanced/process-steps.md)