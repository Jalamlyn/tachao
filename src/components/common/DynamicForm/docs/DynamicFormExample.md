# 动态表单使用示例

本文档提供了一个完整的动态表单配置示例。

## 完整示例

```typescript
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

const formConfig: DynamicFormConfig = {
  metadata: {
    title: "采购申请单",
    description: "用于提交采购申请的电子表单",
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
          description: "请填写申请的基本信息",
          fields: [
            {
              name: "department",
              label: "申请部门",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceId: "departments",
                displayField: "name",
                displayFields: [
                  { key: "name", label: "部门名称" },
                  { key: "code", label: "部门代码" }
                ],
                displayFormat: (resource) =>
                  `${resource.name} (${resource.code})`,
                triggerConfig: {
                  type: "button",
                  text: "选择部门",
                  icon: "mdi:office-building",
                  className: "bg-blue-50 hover:bg-blue-100"
                },
                fieldMapping: {
                  "departmentManager": {
                    field: "manager",
                    transform: (value) => ({
                      dataid: value.id,
                      displayValue: value.name
                    })
                  },
                  "costCenter": "costCenter",
                  "budgetInfo": {
                    fields: ["budget", "currency"],
                    transform: (values) => ({
                      amount: values[0],
                      currency: values[1]
                    })
                  }
                }
              }
            },
            {
              name: "departmentManager",
              label: "部门主管",
              type: "resource",
              required: true,
              disabled: true,
              resourceConfig: {
                resourceId: "employees",
                displayFields: [
                  { key: "name", label: "姓名" },
                  { key: "position", label: "职位" }
                ]
              }
            }
          ]
        }
      ]
    },

    tables: [
      {
        key: "items",
        title: "采购明细",
        icon: "mdi:table",
        description: "请填写需要采购的物品明细",
        config: {
          columns: [
            {
              key: "material",
              title: "物料",
              type: "resource",
              width: 300,
              required: true,
              resourceConfig: {
                resourceId: "materials",
                displayFields: [
                  { key: "name", label: "名称" },
                  { key: "code", label: "编号" },
                  { key: "specification", label: "规格" }
                ],
                showTrigger: true,
                triggerPosition: "right",
                fieldMapping: {
                  "unit": "unit",
                  "unitPrice": {
                    field: "price",
                    transform: (value) => Number(value).toFixed(2)
                  }
                }
              }
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: 120,
              required: true
            },
            {
              key: "unitPrice",
              title: "单价",
              type: "number",
              width: 120,
              required: true
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              width: 120,
              disabled: true,
              render: (value, record) => {
                // 空值检查
                if (!record?.quantity || !record?.unitPrice) {
                  return '0.00'
                }
                const amount = (record.quantity || 0) * (record.unitPrice || 0)
                return amount.toFixed(2)
              },
              summary: {
                render: (records) => {
                  const total = records.reduce((sum, record) =>
                    sum + ((record.quantity || 0) * (record.unitPrice || 0)), 0)
                  return <span className="font-bold text-blue-600">
                    {total.toFixed(2)}
                  </span>
                }
              }
            }
          ],
          summary: {
            show: true,
            label: "合计",
            className: "bg-gray-50 font-bold",
            style: { borderTop: "2px solid #e5e7eb" }
          }
        }
      }
    ],

    processSteps: [
      {
        key: "applicant",
        title: "申请人确认",
        icon: "mdi:account-check",
        description: "申请人确认申请信息",
        required: true,
        fields: [
          {
            name: "confirmDate",
            label: "确认日期",
            type: "date",
            required: true
          },
          {
            name: "signature",
            label: "签名",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          },
          {
            name: "attachments",
            label: "附件",
            type: "upload",
            uploadConfig: {
              uploadType: "file",
              multiple: true,
              maxSize: 10 * 1024 * 1024,
              maxCount: 5,
              thumbnail: true,
              uploadConfig: {
                action: "/api/upload",
                headers: {
                  "X-Upload-Type": "form-attachment"
                },
                withCredentials: true
              },
              previewConfig: {
                modalTitle: "附件预览",
                modalWidth: "80%"
              }
            }
          }
        ]
      },
      {
        key: "manager",
        title: "部门主管审批",
        icon: "mdi:account-supervisor",
        description: "部门主管审核申请",
        required: true,
        dependencies: [
          {
            step: "applicant",
            message: "需要先完成申请人确认"
          }
        ],
        fields: [
          {
            name: "approved",
            label: "审批结果",
            type: "radio",
            required: true,
            options: [
              { label: "同意", value: "approved" },
              { label: "拒绝", value: "rejected" }
            ]
          },
          {
            name: "comment",
            label: "审批意见",
            type: "textarea",
            required: true
          }
        ]
      }
    ]
  },

  orderNumberConfig: {
    prefix: "PO",
    fieldName: "orderNumber",
    label: "采购单号"
  },

  watch: (form) => {
    // ✅ 添加标志位防止递归
    let isCalculating = false;

    const subscription = form.watch((value, { name }) => {
      // ✅ 只监听数量和单价的变化
      if (!isCalculating && (name.includes('.quantity') || name.includes('.price'))) {
        isCalculating = true;
        try {
          const details = form.getValues('tableData.orderDetails') || []

          details.forEach((item, index) => {
            const quantity = Number(item.quantity) || 0
            const price = Number(item.price) || 0
            const newAmount = quantity * price

            // ✅ 比较值是否变化后再设置
            const currentAmount = Number(item.amount) || 0
            if (currentAmount !== newAmount) {
              form.setValue(`tableData.orderDetails.${index}.amount`, newAmount)
            }
          })
        } finally {
          // ✅ 确保标志位被重置
          isCalculating = false
        }
      }
    })
    return () => subscription.unsubscribe()
  },

  validate: async (values) => {
    const errors = {
      fields: {},
      categorizedErrors: {
        required: [],
        invalid: [],
        other: []
      }
    }

    // 业务规则验证
    const items = values.tableData?.items || []
    const totalAmount = items.reduce((sum, item) =>
      sum + (item.quantity || 0) * (item.unitPrice || 0), 0)

    if (totalAmount > values.budgetInfo?.amount) {
      errors.fields.tableData = "采购总额超出预算"
      errors.categorizedErrors.other.push({
        field: "tableData",
        message: "采购总额超出预算"
      })
    }

    return {
      valid: Object.keys(errors.fields).length === 0,
      errors: Object.values(errors.fields),
      fields: errors.fields,
      categorizedErrors: errors.categorizedErrors
    }
  }
}

export default formConfig
```

## 使用示例

```tsx
import { DynamicForm } from "@/components/common/DynamicForm"
import formConfig from "./formConfig"

const PurchaseRequestForm = () => {
  const handleSubmit = async (validationResult, values) => {
    if (validationResult.valid) {
      console.log("Form values:", values)
    }
  }

  return <DynamicForm config={formConfig} onSubmit={handleSubmit} isCreateMode={true} />
}

export default PurchaseRequestForm
```

## 最佳实践和注意事项

### 1. 表格列渲染

在配置表格列的render函数时，请注意以下最佳实践：

```typescript
// 1. 基础用法 - 始终进行空值检查
render: (value, record) => {
  if (!value) return "-"
  return value
}

// 2. 访问嵌套属性 - 使用可选链操作符
render: (value, record) => {
  return record?.parent?.child?.name || "-"
}

// 3. 计算场景 - 确保所有依赖值都存在
render: (value, record) => {
  if (!record?.quantity || !record?.price) {
    return "0.00"
  }
  return (record.quantity * record.price).toFixed(2)
}

// 4. 复杂渲染 - 拆分逻辑提高可读性
render: (value, record) => {
  const formatValue = (val) => {
    if (!val) return "0.00"
    return Number(val).toFixed(2)
  }

  const getDisplayValue = () => {
    if (!record) return "-"
    return `${formatValue(record.amount)} ${record.currency || "CNY"}`
  }

  return getDisplayValue()
}
```

### 2. 资源选择配置

配置资源选择字段时的注意事项：

```typescript
resourceConfig: {
  // 1. 始终提供显示字段配置
  displayFields: [
    { key: "name", label: "名称" },
    { key: "code", label: "编号" }
  ],

  // 2. 使用displayFormat提供更灵活的显示
  displayFormat: (resource) => {
    if (!resource) return ''
    return `${resource.name} (${resource.code})`
  },

  // 3. 字段映射要处理空值情况
  fieldMapping: {
    "targetField": {
      fields: ["sourceField"],
      transform: (values) => {
        if (!values?.[0]) return null
        return {
          value: values[0],
          display: `自定义显示: ${values[0]}`
        }
      }
    }
  }
}
```

### 3. 表单验证

实现表单验证时的最佳实践：

```typescript
validate: async (values) => {
  const errors = {
    fields: {},
    categorizedErrors: {
      required: [],
      invalid: [],
      other: [],
    },
  }

  // 1. 分类处理错误
  if (!values.required_field) {
    errors.fields.required_field = "此字段为必填"
    errors.categorizedErrors.required.push({
      field: "required_field",
      message: "此字段为必填",
    })
  }

  // 2. 业务规则验证
  if (values.end_date && values.start_date > values.end_date) {
    errors.fields.end_date = "结束日期不能早于开始日期"
    errors.categorizedErrors.invalid.push({
      field: "end_date",
      message: "结束日期不能早于开始日期",
    })
  }

  // 3. 复杂验证逻辑
  const validateComplexRule = () => {
    // 复杂验证逻辑
  }

  return {
    valid: Object.keys(errors.fields).length === 0,
    errors: Object.values(errors.fields),
    fields: errors.fields,
    categorizedErrors: errors.categorizedErrors,
  }
}
```

### 4. 常见问题解答

#### 新增表格行时的默认值处理

```typescript
// 在表格配置中添加默认值处理
config: {
  defaultRowData: {
    quantity: 0,
    price: 0,
    amount: '0.00'
  }
}
```

#### 表格列计算字段的处理

```typescript
// 使用watch监听依赖字段变化
watch: (form) => {
  const subscriptions = [
    form.watch(["quantity", "price"], ([quantity, price]) => {
      const amount = ((quantity || 0) * (price || 0)).toFixed(2)
      form.setValue("amount", amount)
    }),
  ]

  return () => {
    subscriptions.forEach((sub) => sub?.unsubscribe?.())
  }
}
```

#### 资源选择后的数据联动

```typescript
// 在resourceConfig中配置fieldMapping
resourceConfig: {
  fieldMapping: {
    "relatedField": {
      field: "sourceField",
      transform: (value) => {
        // 处理联动逻辑
        return transformedValue
      }
    }
  }
}
```

#### 表单步骤依赖控制

```typescript
processSteps: [
  {
    key: "step2",
    dependencies: [
      {
        step: "step1",
        message: "请先完成步骤1",
      },
    ],
    // 添加条件判断
    condition: (values) => {
      return values.step1_field === "completed"
    },
  },
]
```

### 5. 性能优化建议

1. 大数据量表格处理

```typescript
// 使用虚拟滚动
config: {
  virtualScroll: true,
  rowHeight: 48,
  bufferSize: 10
}
```

2. 复杂计算优化

```typescript
// 使用缓存计算结果
const memoizedCalculation = useMemo(() => {
  return expensiveCalculation(dependencies)
}, [dependencies])
```

3. 表单验证优化

```typescript
// 使用防抖处理实时验证
const debouncedValidate = debounce((values) => {
  validate(values)
}, 300)
```

### 6. 安全性建议

1. 文件上传

```typescript
uploadConfig: {
  // 限制文件类型
  accept: '.pdf,.doc,.docx',
  // 限制文件大小
  maxSize: 5 * 1024 * 1024,
  // 文件校验
  beforeUpload: (file) => {
    // 自定义验证逻辑
    return validateFile(file)
  }
}
```

2. 敏感数据处理

```typescript
// 使用加密传输
resourceConfig: {
  headers: {
    'X-Encryption': 'enabled'
  },
  transformResponse: (data) => {
    return decryptData(data)
  }
}
```

### 7. 可访问性建议

1. 表单字段

```typescript
fields: [
  {
    name: "field",
    label: "字段",
    // 添加aria标签
    aria-label: "字段说明",
    // 添加帮助文本
    helpText: "请输入字段内容"
  }
]
```

2. 错误提示

```typescript
validate: (values) => {
  return {
    // 添加aria-live区域
    errorAnnouncement: "表单验证失败，请检查输入",
    errors: [],
  }
}
```
