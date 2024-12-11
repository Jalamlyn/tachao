```typescript
// 完整的动态表单配置示例
const complexFormConfig = {
  metadata: {
    title: "采购申请单",
    description: "用于提交和审批采购申请",
    permissions: {
      edit: true,
      delete: true,
      print: true
    }
  },
  renderConfig: {
    // 基础字段配置 - 使用分组
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
          description: "申请的基本信息",
          fields: [
            {
              name: "applicant",
              label: "申请人",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceId: "employees",
                displayFields: [
                  { key: "name", label: "姓名" },
                  { key: "employeeId", label: "工号" },
                  { key: "department", label: "部门" }
                ],
                triggerConfig: {
                  type: "button",
                  text: "选择申请人",
                  icon: "mdi:account-search",
                  className: "custom-trigger"
                },
                fieldMapping: {
                  "department": "department",
                  "position": {
                    field: "position",
                    transform: (value) => value.toUpperCase()
                  },
                  "contactInfo": {
                    fields: ["email", "phone"],
                    transform: (values) => values.join(" / ")
                  }
                }
              }
            },
            {
              name: "department",
              label: "部门",
              type: "text",
              disabled: true
            },
            {
              name: "position",
              label: "职位",
              type: "text",
              disabled: true
            },
            {
              name: "contactInfo",
              label: "联系方式",
              type: "text",
              disabled: true
            }
          ]
        },
        {
          key: "request",
          title: "申请信息",
          icon: "mdi:file-document-edit",
          description: "采购申请详细信息",
          fields: [
            {
              name: "requestType",
              label: "申请类型",
              type: "select",
              required: true,
              options: [
                { label: "办公用品", value: "office" },
                { label: "IT设备", value: "it" },
                { label: "其他", value: "other" }
              ]
            },
            {
              name: "urgencyLevel",
              label: "紧急程度",
              type: "radio",
              required: true,
              options: [
                { label: "普通", value: "normal" },
                { label: "紧急", value: "urgent" },
                { label: "特急", value: "critical" }
              ]
            },
            {
              name: "expectedDate",
              label: "期望到货日期",
              type: "date",
              required: true
            },
            {
              name: "budget",
              label: "预算金额",
              type: "number",
              required: true,
              validators: [
                (value) => {
                  if (value <= 0) return "预算金额必须大于0"
                  if (value > 1000000) return "单次申请预算不能超过100万"
                }
              ]
            }
          ]
        },
        {
          key: "attachments",
          title: "附件信息",
          icon: "mdi:attachment",
          description: "上传相关附件",
          fields: [
            {
              name: "quotation",
              label: "报价单",
              type: "upload",
              required: true,
              uploadConfig: {
                uploadType: "file",
                multiple: true,
                maxSize: 10 * 1024 * 1024,
                maxCount: 3,
                uploadConfig: {
                  customRequest: async (options) => {
                    // 自定义上传逻辑
                  }
                },
                previewConfig: {
                  modalTitle: "报价单预览",
                  modalWidth: "80%"
                }
              }
            },
            {
              name: "specifications",
              label: "规格说明书",
              type: "upload",
              uploadConfig: {
                uploadType: "file",
                multiple: false,
                maxSize: 5 * 1024 * 1024
              }
            }
          ]
        }
      ]
    },

    // 表格配置
    tables: [
      {
        key: "items",
        title: "采购明细",
        icon: "mdi:table",
        description: "请填写需要采购的物品明细",
        config: {
          columns: [
            {
              key: "product",
              title: "物品",
              type: "resource",
              width: "300px",
              required: true,
              resourceConfig: {
                resourceId: "products",
                displayFields: [
                  { key: "name", label: "名称" },
                  { key: "code", label: "编码" },
                  { key: "specification", label: "规格" }
                ],
                showTrigger: true,
                triggerPosition: "right",
                inlineDisplay: true,
                fieldMapping: {
                  "unitPrice": "price",
                  "unit": "unit",
                  "specification": "specification"
                }
              }
            },
            {
              key: "specification",
              title: "规格",
              type: "text",
              width: "200px",
              editable: false
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: "120px",
              required: true,
              validators: [
                (value) => value <= 0 ? "数量必须大于0" : undefined
              ]
            },
            {
              key: "unitPrice",
              title: "单价",
              type: "number",
              width: "120px",
              editable: false
            },
            {
              key: "unit",
              title: "单位",
              type: "text",
              width: "80px",
              editable: false
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              width: "120px",
              editable: false,
              render: (value, record) => {
                const amount = (record.quantity || 0) * (record.unitPrice || 0)
                return amount.toFixed(2)
              }
            }
          ],
          summary: {
            show: true,
            label: "合计",
            className: "font-bold",
            style: { backgroundColor: "#f9fafb" }
          }
        }
      }
    ],

    // 流程步骤配置
    processSteps: [
      {
        key: "department",
        title: "部门审批",
        icon: "mdi:account-check",
        description: "部门主管审批",
        weight: 1,
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
            name: "comments",
            label: "审批意见",
            type: "textarea",
            required: true
          },
          {
            name: "signature",
            label: "签名",
            type: "signature",
            required: true,
            width: 300,
            height: 100
          }
        ]
      },
      {
        key: "finance",
        title: "财务审批",
        icon: "mdi:currency-usd",
        description: "财务部门审批",
        weight: 2,
        dependencies: [
          {
            step: "department",
            condition: {
              field: "approved",
              value: "approved"
            },
            message: "需要先通过部门审批"
          }
        ],
        fields: [
          {
            name: "budgetAccount",
            label: "预算科目",
            type: "select",
            required: true,
            options: [
              { label: "办公费用", value: "office" },
              { label: "设备采购", value: "equipment" },
              { label: "其他支出", value: "other" }
            ]
          },
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
            name: "comments",
            label: "审批意见",
            type: "textarea",
            required: true
          }
        ]
      },
      {
        key: "procurement",
        title: "采购确认",
        icon: "mdi:shopping",
        description: "采购部门确认",
        weight: 3,
        dependencies: [
          {
            step: "finance",
            condition: {
              field: "approved",
              value: "approved"
            },
            message: "需要先通过财务审批"
          }
        ],
        fields: [
          {
            name: "supplier",
            label: "供应商",
            type: "resource",
            required: true,
            resourceConfig: {
              resourceId: "suppliers",
              displayFields: [
                { key: "name", label: "供应商名称" },
                { key: "code", label: "供应商代码" },
                { key: "contact", label: "联系人" }
              ]
            }
          },
          {
            name: "estimatedDeliveryDate",
            label: "预计到货日期",
            type: "date",
            required: true
          },
          {
            name: "comments",
            label: "处理意见",
            type: "textarea"
          }
        ]
      }
    ]
  },

  // 单号配置
  orderNumberConfig: {
    prefix: "PO",
    fieldName: "orderNumber",
    label: "采购单号"
  },

  // 表单验证
  validate: async (values, context) => {
    const errors = []
    
    // 检查预算
    const totalAmount = values.tableData?.items?.reduce((sum, item) => 
      sum + (item.quantity || 0) * (item.unitPrice || 0), 0) || 0
    
    if (totalAmount > values.budget) {
      errors.push("采购总金额不能超过预算金额")
    }

    // 检查期望到货日期
    const expectedDate = new Date(values.expectedDate)
    if (expectedDate < new Date()) {
      errors.push("期望到货日期不能早于今天")
    }

    return {
      valid: errors.length === 0,
      errors,
      fields: {}
    }
  },

  // 字段联动
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 监听申请类型变化
      if (name === "requestType") {
        const budgetField = form.getValues("budget")
        if (value === "it" && budgetField > 50000) {
          form.setError("budget", {
            type: "custom",
            message: "IT设备单次采购金额不能超过5万"
          })
        }
      }
    })
    
    return () => subscription.unsubscribe()
  }
}
```