# DynamicForm AI 配置文档

## 类型系统概述

本文档采用结构化格式，便于AI模型理解和处理DynamicForm组件的配置系统。

### 核心类型定义

```typescript
// 字段类型定义
type FormFieldType =
  | "text"
  | "password"
  | "number"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "date"
  | "datetime"
  | "file"
  | "image"
  | "custom"
  | "resource"
  | "signature"
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"

// 手动输入字段类型
type ManualInputFieldType = 
  | "text" 
  | "number" 
  | "email" 
  | "tel" 
  | "textarea" 
  | "select" 
  | "date" 
  | "datetime"

// 资源配置
interface ResourceConfig {
  resourceTitle: string
  allowManualInput?: boolean
  manualInputFields?: Array<{
    key: string
    label: string
    type?: ManualInputFieldType
    required?: boolean
    options?: Array<{
      label: string
      value: string | number
    }>
  }>
}

// 表单字段
interface FormField {
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
  tooltip?: TooltipConfig
  validators?: Array<(value: any, allValues?: any) => string | undefined>
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }> | ((form: UseFormReturn<any>) => Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>)
  accept?: string
  resourceConfig?: ResourceConfig
  onUpload?: (file: File) => Promise<void>
  render?: (props: { field: any; form: UseFormReturn<any>; isEditable: boolean }) => ReactNode
  width?: number | string
  height?: number
  lineWidth?: number
  lineColor?: string
  className?: string
  style?: React.CSSProperties
  checkedLabel?: string
  uncheckedLabel?: string
  min?: number
  max?: number
  step?: number
  layout?: "horizontal" | "vertical"
}

// 表单字段分组
interface FormFieldGroup {
  key: string
  title: string
  fields: FormField[]
  description?: string
  icon?: string
  className?: string
  style?: React.CSSProperties
}

// 表格列配置
interface TableColumn {
  key: string
  title: string
  type: FormFieldType
  width?: string | number
  editable?: boolean
  required?: boolean
  placeholder?: string
  options?: Array<{
    label: string
    value: string | number
  }>
  resourceConfig?: ResourceConfig
  render?: (value: any, record: any, index: number) => ReactNode
  summary?: {
    render?: (value: any) => ReactNode
  }
  className?: string
  style?: React.CSSProperties
}

// 流程步骤
interface ProcessStep {
  key: string
  title: string
  description?: string
  icon?: string
  fields?: FormField[]
  dependencies?: ProcessStepDependency[]
  weight?: number
  timeout?: ProcessStepTimeout
  approvers?: ProcessStepApprovers
  className?: string
  style?: React.CSSProperties
}

// 表单配置
interface DynamicFormConfig {
  metadata: {
    title: string
    description?: string
    permissions?: {
      edit?: boolean
      delete?: boolean
      print?: boolean
    }
  }
  renderConfig: {
    basicFields: FormField[] | {
      groups: FormFieldGroup[]
      defaultGroup?: string
    }
    table?: TableConfig
    tables?: TableGroup[]
    processSteps?: ProcessStep[]
  }
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
  watch?: (form: UseFormReturn<any>) => () => void
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
  validationRules?: Record<string, ValidationRule>
  eventHandlers?: FormEventHandlers
}
```

### 配置示例

#### 1. 基础表单配置

```typescript
{
  metadata: {
    title: "基础表单",
    permissions: {
      edit: true,
      print: true
    }
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true,
        className: "w-full",
        validators: [
          (value) => value?.length > 2 ? undefined : "姓名至少3个字符"
        ]
      },
      {
        name: "age",
        label: "年龄",
        type: "number",
        required: true,
        min: 0,
        max: 150
      },
      {
        name: "birthday",
        label: "生日",
        type: "date",
        className: "w-full"
      }
    ]
  },
  validationRules: {
    name: {
      required: true,
      minLength: 3,
      message: "姓名不能少于3个字符"
    }
  }
}
```

#### 2. 分组表单配置

```typescript
{
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
          className: "space-y-4",
          fields: [
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true
            },
            {
              name: "gender",
              label: "性别",
              type: "select",
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" }
              ]
            }
          ]
        },
        {
          key: "contact",
          title: "联系方式",
          icon: "mdi:phone",
          description: "请填写准确的联系方式",
          fields: [
            {
              name: "phone",
              label: "手机号",
              type: "tel",
              required: true,
              validators: [
                (value) => /^1[3-9]\d{9}$/.test(value) ? undefined : "请输入有效的手机号"
              ]
            },
            {
              name: "email",
              label: "邮箱",
              type: "email",
              validators: [
                (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : "请输入有效的邮箱"
              ]
            }
          ]
        }
      ],
      defaultGroup: "basic"
    }
  }
}
```

#### 3. 资源字段配置

```typescript
{
  name: "supplier",
  label: "供应商",
  type: "resource",
  required: true,
  resourceConfig: {
    resourceTitle: "供应商主数据",
    allowManualInput: true,
    manualInputFields: [
      {
        key: "name",
        label: "供应商名称",
        type: "text",
        required: true
      },
      {
        key: "code",
        label: "供应商编号",
        type: "text"
      },
      {
        key: "type",
        label: "供应商类型",
        type: "select",
        options: [
          { label: "生产商", value: "manufacturer" },
          { label: "代理商", value: "agent" }
        ]
      },
      {
        key: "contact",
        label: "联系人",
        type: "text"
      },
      {
        key: "phone",
        label: "联系电话",
        type: "tel"
      },
      {
        key: "address",
        label: "地址",
        type: "textarea"
      }
    ]
  },
  className: "w-full",
  style: {
    marginBottom: "1rem"
  }
}
```

#### 4. 表格配置

```typescript
{
  renderConfig: {
    table: {
      columns: [
        {
          key: "name",
          title: "产品名称",
          type: "text",
          required: true,
          width: "200px"
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          required: true,
          width: "100px",
          className: "text-right"
        },
        {
          key: "price",
          title: "单价",
          type: "number",
          required: true,
          width: "120px",
          className: "text-right"
        },
        {
          key: "amount",
          title: "金额",
          type: "number",
          width: "150px",
          className: "text-right font-bold",
          editable: false,
          summary: {
            render: (values) => {
              const total = values.reduce((sum: number, row: any) => sum + (row.amount || 0), 0)
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
  }
}
```

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
            className: "min-h-[100px]"
          }
        ]
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
            required: true
          },
          {
            name: "approvalSignature",
            label: "审批签名",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ],
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
        approvers: {
          type: "single",
          roles: ["manager"],
          minApprovers: 1,
          maxApprovers: 1,
          deadline: 24 * 60 * 60 * 1000, // 24小时
          notifyType: "email",
          escalation: {
            after: 4 * 60 * 60 * 1000, // 4小时后升级
            to: ["director"]
          }
        },
        timeout: {
          duration: 48 * 60 * 60 * 1000, // 48小时
          action: "auto-reject",
          message: "审批超时自动拒绝",
          callback: (step) => {
            console.log(`Step ${step} timeout`)
          }
        }
      }
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

### 注意事项

1. 类型安全：
- 所有配置都有完整的TypeScript类型定义
- 建议使用类型检查确保配置正确性

2. 性能考虑：
- 避免在render函数中创建新的组件
- 使用useMemo和useCallback优化性能
- 大量数据时考虑分页或虚拟滚动

3. 最佳实践：
- 保持配置结构清晰
- 合理使用分组功能
- 适当使用验证规则
- 正确处理异步操作

4. 样式建议：
- 使用主题变量
- 遵循响应式设计
- 保持样式一致性

本文档针对AI模型优化，提供了结构化的类型定义和示例。每个配置项都有完整的类型信息和使用示例，便于AI理解和生成正确的配置代码。