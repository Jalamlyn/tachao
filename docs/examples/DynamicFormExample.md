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
    const subscriptions = [
      // 监听数量和单价变化，计算金额
      form.watch(["quantity", "unitPrice"], ([quantity, unitPrice]) => {
        const amount = (quantity || 0) * (unitPrice || 0)
        form.setValue("amount", amount.toFixed(2))
      }),

      // 监听审批结果变化
      form.watch("approved", (value) => {
        const commentField = form.getValues("comment")
        if (value === "rejected" && !commentField) {
          form.setError("comment", {
            type: "manual",
            message: "拒绝时必须填写审批意见"
          })
        }
      })
    ]

    return () => {
      subscriptions.forEach(subscription => 
        subscription?.unsubscribe?.())
    }
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

  return (
    <DynamicForm
      config={formConfig}
      onSubmit={handleSubmit}
      isCreateMode={true}
    />
  )
}

export default PurchaseRequestForm
```