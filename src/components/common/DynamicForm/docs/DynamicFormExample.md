# 动态表单使用示例

本文档提供了一个完整的动态表单配置示例。

## 完整示例

```jsx
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

const formConfig: DynamicFormConfig = {
  metadata: {
    title: "采购申请单",
    description: "用于提交采购申请的电子表单",
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
              type: "orderNumber",
              name: "orderNo",
              label: "采购单号",
              prefix: "PO",
              disabled: true
            },
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
            },
           {
            name: "customRender",
            label: "自定义渲染",
            type: "custom",
            render: ({ field, form, isEditable }) => (
              <div
              style={{
                padding: "10px",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "5px",
                textAlign: "center"
              }}
              >
              <h3 style={{ margin: 0 }}>这是一个自定义渲染字段</h3>
              <p style={{ fontSize: "14px", color: "#666" }}>
                你可以在这里展示任何静态内容或动态内容
              </p>
              </div>
            )
            }
          ]
        }
      ],
      // 新增布局配置选项
      layout: 'vertical' // 'tabs' | 'vertical'
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
              key: "table.items.orderNo",
              title: "物料编号",
              type: "orderNumber",
              width: 200,
              prefix: "MAT"
            },
            {
              key: "table.items.material",
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
                  "table.items.unit": "unit",
                  "table.items.unitPrice": {
                    field: "price",
                    transform: (value) => Number(value).toFixed(2)
                  }
                }
              }
            },
            {
              key: "table.items.quantity",
              title: "数量",
              type: "number",
              width: 120,
              required: true
            },
            {
              key: "table.items.unitPrice",
              title: "单价",
              type: "number",
              width: 120,
              required: true
            },
            {
              key: "table.items.amount",
              title: "金额",
              type: "number",
              width: 120,
              disabled: true,
              formatConfig: {
                type: "amount",
                options: {
                  precision: 2,
                  currency: "CNY"
                }
              }
            }
          ],
          summary: {
            show: true,
            firstColumnText: "合计",
            onCompute: (data) => {
              // 计算汇总数据
              const total = data.reduce((sum, row) => 
                sum + (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0), 0)
              
              // 返回与列key对应的汇总数据
              return {
                "table.items.amount": total
              }
            }
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

  watch: (form) => {
    let isCalculating = false;

    const subscription = form.watch((value, { name }) => {
      if (!isCalculating && (name.startsWith('table.items.') || name.startsWith(''))) {
        isCalculating = true;
        try {
          const items = form.getValues('table.items') || []

          items.forEach((item, index) => {
            const quantity = Number(item.quantity) || 0
            const price = Number(item.price) || 0
            const newAmount = quantity * price

            const currentAmount = Number(item.amount) || 0
            if (currentAmount !== newAmount) {
              form.setValue(`table.items.${index}.amount`, newAmount)
            }
          })
        } finally {
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

    const items = values.table?.items || []
    const totalAmount = items.reduce((sum, item) =>
      sum + (item.quantity || 0) * (item.unitPrice || 0), 0)

    if (totalAmount > values.form?.basic?.budgetInfo?.amount) {
      errors.fields['table.items'] = "采购总额超出预算"
      errors.categorizedErrors.other.push({
        field: 'table.items',
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
      //console.log("Form values:", values)
    }
  }

  return <DynamicForm config={formConfig} />
}

export default PurchaseRequestForm
```

## 表格汇总配置说明

表格支持灵活的汇总计算功能，通过 `summary` 配置实现：

```typescript
{
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
      formatConfig: {
        type: "amount",
        options: {
          precision: 2,
          currency: "CNY"
        }
      }
    }
  ],
  summary: {
    show: true,  // 是否显示汇总行
    firstColumnText: "合计",  // 第一列显示的文本
    onCompute: (data) => {
      // 计算汇总数据
      const quantity = data.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)
      const amount = data.reduce((sum, row) => 
        sum + (Number(row.quantity) || 0) * (Number(row.price) || 0), 0)
      
      // 返回与列key对应的汇总数据
      return {
        quantity,  // 数量合计
        amount    // 金额合计
      }
    }
  }
}
```

### 汇总配置说明

1. `show`: 控制是否显示汇总行
2. `firstColumnText`: 设置汇总行第一列显示的文本
3. `onCompute`: 计算汇总数据的函数
   - 参数: `data` - 表格的所有数据
   - 返回值: 与列key对应的汇总数据对象

### 格式化配置

汇总数据会自动应用对应列的 `formatConfig` 配置进行格式化显示：

```typescript
{
  key: "amount",
  title: "金额",
  type: "number",
  formatConfig: {
    type: "amount",
    options: {
      precision: 2,
      currency: "CNY"
    }
  }
}
```

### 最佳实践

1. 返回的汇总数据key要与列key保持一致
2. 注意数值计算时的类型转换和空值处理
3. 可以只返回需要显示汇总的列
4. 建议使用formatConfig统一数据显示格式

```typescript
// 推荐的汇总配置方式
summary: {
  show: true,
  firstColumnText: "合计",
  onCompute: (data) => {
    // 处理空值和类型转换
    const validData = data.filter(row => 
      row.quantity != null && row.price != null)
    
    // 计算汇总
    const result = validData.reduce((acc, row) => ({
      quantity: acc.quantity + Number(row.quantity),
      amount: acc.amount + (Number(row.quantity) * Number(row.price))
    }), { quantity: 0, amount: 0 })
    
    // 只返回需要显示汇总的列
    return {
      quantity: result.quantity,
      amount: result.amount
    }
  }
}
```

## 基础字段布局配置

动态表单支持两种基础字段布局模式：

### 1. Tabs布局（默认）

字段分组以标签页形式水平展示：

```typescript
const formConfig = {
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          fields: [...]
        },
        {
          key: "additional",
          title: "附加信息",
          fields: [...]
        }
      ],
      layout: 'tabs' // 默认值，可省略
    }
  }
}
```

### 2. 垂直布局

字段分组以卡片形式垂直排列：

```typescript
const formConfig = {
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          fields: [...]
        },
        {
          key: "additional",
          title: "附加信息",
          fields: [...]
        }
      ],
      layout: 'vertical' // 使用垂直布局
    }
  }
}
```

垂直布局特点：
- 所有分组同时可见
- 每个分组使用卡片样式展示
- 支持分组标题、图标和描述
- 包含平滑的动画效果
- 适合内容较多或需要同时查看多个分组的场景