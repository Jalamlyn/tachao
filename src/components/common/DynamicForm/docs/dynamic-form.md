# DynamicForm AI 配置文档

## 类型定义

```typescript
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

interface ResourceConfig {
  resourceTitle: string
  allowManualInput?: boolean
  manualInputFields?: Array<{
    key: string
    label: string
    type?: "text" | "number" | "email" | "tel"
    required?: boolean
  }>
}

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
  }>
  accept?: string
  resourceConfig?: ResourceConfig
  onUpload?: (file: File) => Promise<void>
  render?: (props: { field: any; form: UseFormReturn<any>; isEditable: boolean }) => ReactNode
  width?: number | string
  height?: number
  lineWidth?: number
  lineColor?: string
  className?: string
  checkedLabel?: string
  uncheckedLabel?: string
  min?: number
  max?: number
  step?: number
  layout?: "horizontal" | "vertical"
}

interface FormFieldGroup {
  key: string
  title: string
  fields: FormField[]
  description?: string
  icon?: string
}

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
    calculate?: (records: any[]) => any
    render?: (value: any) => ReactNode
  }
}

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
}

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
    basicFields:
      | FormField[]
      | {
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
}
```

## 配置示例

### 基础表单

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
        required: true
      },
      {
        name: "age",
        label: "年龄",
        type: "number",
        required: true
      }
    ]
  }
}
```

### 分组表单

```typescript
{
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
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
          fields: [
            {
              name: "phone",
              label: "手机号",
              type: "tel",
              required: true
            },
            {
              name: "email",
              label: "邮箱",
              type: "email"
            }
          ]
        }
      ],
      defaultGroup: "basic"
    }
  }
}
```

### 表格配置

```typescript
{
  renderConfig: {
    table: {
      columns: [
        {
          key: "name",
          title: "产品名称",
          type: "text",
          required: true
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          required: true,
          calculate: {
            formula: "price * amount",
            dependencies: ["price", "amount"]
          }
        },
        {
          key: "price",
          title: "单价",
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
}
```

### 多表格配置

```typescript
{
  renderConfig: {
    tables: [
      {
        key: "products",
        title: "产品清单",
        icon: "mdi:package",
        config: {
          columns: [
            {
              key: "name",
              title: "产品名称",
              type: "text",
              required: true,
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              required: true,
            },
          ],
        },
      },
      {
        key: "services",
        title: "服务项目",
        icon: "mdi:cog",
        config: {
          columns: [
            {
              key: "serviceName",
              title: "服务名称",
              type: "text",
              required: true,
            },
            {
              key: "price",
              title: "价格",
              type: "number",
              required: true,
            },
          ],
        },
      },
    ]
  }
}
```

### 资源字段配置（新增手动输入支持）

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
        key: "contact",
        label: "联系人",
        type: "text"
      },
      {
        key: "phone",
        label: "联系电话",
        type: "tel"
      }
    ]
  }
}
```

### 流程确认配置

```typescript
{
  renderConfig: {
    processSteps: [
      {
        key: "submit",
        title: "提交",
        icon: "mdi:send",
        fields: [
          {
            name: "comment",
            label: "备注",
            type: "textarea",
          },
        ],
      },
      {
        key: "approve",
        title: "审批",
        icon: "mdi:check",
        fields: [
          {
            name: "approvalComment",
            label: "审批意见",
            type: "textarea",
            required: true,
          },
        ],
        dependencies: [
          {
            step: "submit",
            condition: {
              field: "comment",
              value: true,
            },
          },
        ],
        approvers: {
          type: "single",
          roles: ["manager"],
        },
      },
    ]
  }
}
```

### 完整配置示例

```typescript
{
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
            },
            {
              name: "customer",
              label: "客户",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceTitle: "客户主数据",
                allowManualInput: true,
                manualInputFields: [
                  { key: "name", label: "客户名称", required: true },
                  { key: "code", label: "客户编号" },
                  { key: "contact", label: "联系人" },
                  { key: "phone", label: "联系电话", type: "tel" }
                ]
              }
            }
          ]
        },
        {
          key: "delivery",
          title: "交付信息",
          icon: "mdi:truck",
          fields: [
            {
              name: "deliveryDate",
              label: "交付日期",
              type: "date",
              required: true
            },
            {
              name: "address",
              label: "交付地址",
              type: "textarea",
              required: true
            }
          ]
        }
      ]
    },
    tables: [
      {
        key: "products",
        title: "产品明细",
        icon: "mdi:package",
        config: {
          columns: [
            {
              key: "product",
              title: "产品",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceTitle: "产品主数据",
                allowManualInput: true,
                manualInputFields: [
                  { key: "name", label: "产品名称", required: true },
                  { key: "code", label: "产品编号" },
                  { key: "spec", label: "规格" }
                ]
              }
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              required: true
            },
            {
              key: "price",
              title: "单价",
              type: "number",
              required: true
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              calculate: {
                formula: "quantity * price",
                dependencies: ["quantity", "price"]
              }
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
            name: "submitterComment",
            label: "提交说明",
            type: "textarea"
          }
        ]
      },
      {
        key: "approve",
        title: "审批",
        icon: "mdi:check",
        fields: [
          {
            name: "approvalComment",
            label: "审批意见",
            type: "textarea",
            required: true
          }
        ],
        dependencies: [
          {
            step: "submit",
            condition: {
              field: "submitterComment",
              value: true
            }
          }
        ],
        approvers: {
          type: "single",
          roles: ["manager"],
          minApprovers: 1
        }
      }
    ]
  },
  orderNumberConfig: {
    prefix: "SO",
    fieldName: "orderNumber",
    label: "订单编号"
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "customer") {
        form.setValue("address", value.customer?.address || "")
      }
    })
    return () => subscription.unsubscribe()
  },
  validate: async (values) => {
    const errors = []
    if (values.deliveryDate < values.orderDate) {
      errors.push("交付日期不能早于订单日期")
    }
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```