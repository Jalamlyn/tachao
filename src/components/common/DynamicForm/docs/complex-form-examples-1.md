# DynamicForm 复杂配置示例

本文档提供了一系列完整的动态表单配置示例，涵盖了各种复杂场景和使用案例。

## 1. 采购申请表单示例

这是一个完整的采购申请表单配置示例，包含基本信息、多个明细表格和审批流程。

```typescript
{
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
    // 基本信息配置 - 使用分组
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
          description: "申请人和申请基本信息",
          fields: [
            {
              name: "applicant",
              label: "申请人",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceId: "resource_employee",
                displayField: "name", // 使用name作为主显示字段
                displayFormat: (resource) => `${resource.name} (${resource.department})`, // 自定义显示格式
                triggerConfig: { // 自定义触发器
                  type: "button",
                  text: "选择申请人",
                  icon: "mdi:account-search"
                },
                displayFields: [
                  { key: "name", label: "姓名" },
                  { key: "department", label: "部门" },
                  { key: "position", label: "职位" }
                ],
                fieldMapping: {
                  "department": "department",
                  "position": "position"
                }
              }
            },
            {
              name: "department",
              label: "所属部门",
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
              name: "applyDate",
              label: "申请日期",
              type: "date",
              required: true
            },
            {
              name: "expectedDate",
              label: "期望到货日期",
              type: "date",
              required: true,
              validators: [
                (value, allValues) => {
                  if (new Date(value) <= new Date(allValues.applyDate)) {
                    return "期望到货日期必须晚于申请日期"
                  }
                  return undefined
                }
              ]
            }
          ]
        },
        {
          key: "purpose",
          title: "申请用途",
          icon: "mdi:target",
          description: "详细说明采购目的和用途",
          fields: [
            {
              name: "purpose",
              label: "采购用途",
              type: "select",
              required: true,
              options: [
                { label: "日常办公", value: "office" },
                { label: "项目需求", value: "project" },
                { label: "设备更新", value: "equipment" },
                { label: "其他", value: "other" }
              ]
            },
            {
              name: "projectCode",
              label: "项目编号",
              type: "resource",
              hidden: (form) => form.watch("purpose") !== "project",
              required: (form) => form.watch("purpose") === "project",
              resourceConfig: {
                resourceId: "resource_project",
                displayField: "code", // 使用code作为主显示字段
                displayFormat: (resource) => `${resource.code} - ${resource.name}`, // 自定义显示格式
                triggerConfig: { // 自定义触发器
                  type: "button",
                  text: "选择项目",
                  icon: "mdi:folder-search"
                },
                displayFields: [
                  { key: "code", label: "项目编号" },
                  { key: "name", label: "项目名称" }
                ]
              }
            },
            {
              name: "description",
              label: "详细说明",
              type: "textarea",
              required: true,
              className: "min-h-[100px]"
            }
          ]
        }
      ]
    },

    // 多表格配置
    tables: [
      {
        key: "materials",
        title: "物料清单",
        icon: "mdi:package-variant",
        description: "请填写需要采购的物料信息",
        config: {
          columns: [
            {
              key: "material",
              title: "物料",
              type: "resource",
              width: "300px",
              required: true,
              resourceConfig: {
                resourceId: "resource_material",
                displayField: "name", // 使用name作为主显示字段
                displayFormat: (resource) => `${resource.code} - ${resource.name}`, // 自定义显示格式
                showTrigger: true, // 显示触发按钮
                triggerPosition: "right", // 触发按钮位置
                inlineDisplay: true, // 内联显示选择界面
                displayFields: [
                  { key: "code", label: "编号" },
                  { key: "name", label: "名称" },
                  { key: "spec", label: "规格" }
                ],
                fieldMapping: {
                  "materialCode": "code",
                  "materialName": "name",
                  "spec": "spec",
                  "unit": "unit",
                  "suggestedPrice": "price"
                }
              }
            },
            {
              key: "materialCode",
              title: "物料编号",
              type: "text",
              width: "120px",
              editable: false
            },
            {
              key: "materialName",
              title: "物料名称",
              type: "text",
              width: "200px",
              editable: false
            },
            {
              key: "spec",
              title: "规格型号",
              type: "text",
              width: "150px",
              editable: false
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: "100px",
              required: true,
              validators: [
                (value) => {
                  if (value <= 0) return "数量必须大于0"
                  return undefined
                }
              ]
            },
            {
              key: "unit",
              title: "单位",
              type: "text",
              width: "80px",
              editable: false
            },
            {
              key: "suggestedPrice",
              title: "建议单价",
              type: "number",
              width: "120px",
              editable: false,
              className: "text-right"
            },
            {
              key: "actualPrice",
              title: "实际单价",
              type: "number",
              width: "120px",
              required: true,
              className: "text-right",
              validators: [
                (value, allValues) => {
                  const row = allValues.find(v => v.actualPrice === value)
                  if (value > row.suggestedPrice * 1.2) {
                    return "实际单价不能超过建议价格的20%"
                  }
                  return undefined
                }
              ]
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              width: "150px",
              editable: false,
              className: "text-right font-bold",
              render: (_, record) => {
                const amount = (record.quantity || 0) * (record.actualPrice || 0)
                return `¥${amount.toFixed(2)}`
              }
            }
          ],
          summary: {
            show: true,
            label: "合计",
            className: "bg-gray-50 font-bold",
          }
        }
      },
      {
        key: "suppliers",
        title: "供应商信息",
        icon: "mdi:account-group",
        description: "请选择建议的供应商",
        config: {
          columns: [
            {
              key: "supplier",
              title: "供应商",
              type: "resource",
              width: "300px",
              required: true,
              resourceConfig: {
                resourceId: "resource_supplier",
                displayField: "name", // 使用name作为主显示字段
                displayFormat: (resource) => `${resource.code} - ${resource.name}`, // 自定义显示格式
                showTrigger: true, // 显示触发按钮
                triggerPosition: "right", // 触发按钮位置
                displayFields: [
                  { key: "code", label: "编号" },
                  { key: "name", label: "名称" },
                  { key: "level", label: "等级" }
                ],
                fieldMapping: {
                  "supplierCode": "code",
                  "supplierName": "name",
                  "level": "level",
                  "contact": "contact",
                  "phone": "phone"
                }
              }
            },
            {
              key: "supplierCode",
              title: "供应商编号",
              type: "text",
              width: "120px",
              editable: false
            },
            {
              key: "supplierName",
              title: "供应商名称",
              type: "text",
              width: "200px",
              editable: false
            },
            {
              key: "level",
              title: "供应商等级",
              type: "text",
              width: "100px",
              editable: false
            },
            {
              key: "contact",
              title: "联系人",
              type: "text",
              width: "120px",
              editable: false
            },
            {
              key: "phone",
              title: "联系电话",
              type: "text",
              width: "150px",
              editable: false
            },
            {
              key: "priority",
              title: "优先级",
              type: "select",
              width: "100px",
              required: true,
              options: [
                { label: "首选", value: "1" },
                { label: "备选", value: "2" },
                { label: "候补", value: "3" }
              ]
            },
            {
              key: "comment",
              title: "备注",
              type: "text",
              width: "200px"
            }
          ]
        }
      }
    ],

    // 流程步骤配置
    processSteps: [
      {
        key: "submit",
        title: "提交申请",
        icon: "mdi:send",
        description: "请确认申请信息准确无误",
        fields: [
          {
            name: "submitComment",
            label: "申请说明",
            type: "textarea",
            className: "min-h-[100px]"
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
              accept: ".pdf,.doc,.docx,.xlsx"
            }
          }
        ]
      },
      {
        key: "departmentApprove",
        title: "部门审批",
        icon: "mdi:account-check",
        description: "部门主管审批",
        weight: 2,
        fields: [
          {
            name: "departmentComment",
            label: "审批意见",
            type: "textarea",
            required: true
          },
          {
            name: "departmentSignature",
            label: "签名确认",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ],
        dependencies: [
          {
            step: "submit",
            message: "请先完成提交步骤"
          }
        ]
      },
      {
        key: "financeApprove",
        title: "财务审批",
        icon: "mdi:currency-usd",
        description: "财务部门审批",
        weight: 3,
        fields: [
          {
            name: "budgetCheck",
            label: "预算检查",
            type: "radio",
            required: true,
            options: [
              { label: "在预算内", value: "within" },
              { label: "超出预算", value: "exceed" },
              { label: "需要追加预算", value: "additional" }
            ]
          },
          {
            name: "financeComment",
            label: "审批意见",
            type: "textarea",
            required: true
          },
          {
            name: "financeSignature",
            label: "签名确认",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ],
        dependencies: [
          {
            step: "departmentApprove",
            message: "请先完成部门审批"
          }
        ]
      },
      {
        key: "finalApprove",
        title: "最终审批",
        icon: "mdi:gavel",
        description: "金额超过10万需要总经理审批",
        weight: 4,
        fields: [
          {
            name: "finalComment",
            label: "审批意见",
            type: "textarea",
            required: true
          },
          {
            name: "finalSignature",
            label: "签名确认",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ],
        dependencies: [
          {
            step: "financeApprove",
            message: "请先完成财务审批"
          }
        ]
      }
    ]
  },

  // 单号配置
  orderNumberConfig: {
    prefix: "PO",
    fieldName: "orderNumber",
    label: "采购申请单号"
  },

  // 表单验证配置
  validate: async (values) => {
    const errors = []

    // 验证期望到货日期
    if (values.expectedDate) {
      const days = Math.floor((new Date(values.expectedDate) - new Date()) / (1000 * 60 * 60 * 24))
      if (days < 7) {
        errors.push("期望到货日期至少需要7天的采购时间")
      }
    }

    // 验证物料清单
    const materials = values.tableData?.materials || []
    if (materials.length === 0) {
      errors.push("至少需要添加一个采购物料")
    }

    // 计算总金额
    const totalAmount = materials.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.actualPrice || 0)
    }, 0)

    // 验证供应商
    const suppliers = values.tableData?.suppliers || []
    if (suppliers.length === 0) {
      errors.push("至少需要选择一个供应商")
    }

    // 验证首选供应商
    const primarySuppliers = suppliers.filter(s => s.priority === "1")
    if (primarySuppliers.length === 0) {
      errors.push("必须指定至少一个首选供应商")
    }
    if (primarySuppliers.length > 1) {
      errors.push("只能指定一个首选供应商")
    }

    // 特殊审批要求
    if (totalAmount > 100000) {
      const finalApproval = values.processConfirmations?.finalApprove
      if (!finalApproval?.confirmed) {
        errors.push("采购金额超过10万，需要总经理审批")
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      fields: {}
    }
  },

  // 表单联动配置
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 监听物料选择，自动计算金额
      if (name?.startsWith("tableData.materials") &&
          (name?.endsWith(".quantity") || name?.endsWith(".actualPrice"))) {
        const materials = form.getValues("tableData.materials") || []
        materials.forEach((item, index) => {
          const amount = (item.quantity || 0) * (item.actualPrice || 0)
          form.setValue(`tableData.materials.${index}.amount`, amount)
        })
      }

      // 监听采购用途变化
      if (name === "purpose") {
        const purpose = form.getValues("purpose")
        // 如果是项目采购，显示项目编号字段
        form.setValue("projectCode.hidden", purpose !== "project")
        form.setValue("projectCode.required", purpose === "project")
      }
    })

    return () => subscription.unsubscribe()
  }
}
```