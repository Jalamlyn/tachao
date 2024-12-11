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

## 2. 设备维修工单示例

这是一个设备维修工单的配置示例，展示了如何处理维修过程记录和多人协作。

```typescript
{
  metadata: {
    title: "设备维修工单",
    description: "用于记录设备维修过程和结果",
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
          key: "device",
          title: "设备信息",
          icon: "mdi:devices",
          fields: [
            {
              name: "device",
              label: "维修设备",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceId: "resource_device",
                displayFields: [
                  { key: "code", label: "设备编号" },
                  { key: "name", label: "设备名称" },
                  { key: "model", label: "型号" },
                  { key: "department", label: "所属部门" }
                ],
                fieldMapping: {
                  "deviceCode": "code",
                  "deviceName": "name",
                  "deviceModel": "model",
                  "department": "department"
                }
              }
            },
            {
              name: "deviceCode",
              label: "设备编号",
              type: "text",
              disabled: true
            },
            {
              name: "deviceName",
              label: "设备名称",
              type: "text",
              disabled: true
            },
            {
              name: "deviceModel",
              label: "设备型号",
              type: "text",
              disabled: true
            },
            {
              name: "department",
              label: "所属部门",
              type: "text",
              disabled: true
            }
          ]
        },
        {
          key: "fault",
          title: "故障信息",
          icon: "mdi:alert",
          fields: [
            {
              name: "faultType",
              label: "故障类型",
              type: "select",
              required: true,
              options: [
                { label: "机械故障", value: "mechanical" },
                { label: "电气故障", value: "electrical" },
                { label: "软件故障", value: "software" },
                { label: "其他", value: "other" }
              ]
            },
            {
              name: "urgency",
              label: "紧急程度",
              type: "radio",
              required: true,
              options: [
                { label: "一般", value: "normal" },
                { label: "紧急", value: "urgent" },
                { label: "特急", value: "critical" }
              ]
            },
            {
              name: "faultDescription",
              label: "故障描述",
              type: "textarea",
              required: true,
              className: "min-h-[100px]"
            },
            {
              name: "faultImages",
              label: "故障图片",
              type: "upload",
              uploadConfig: {
                uploadType: "image",
                multiple: true,
                maxSize: 5 * 1024 * 1024,
                maxCount: 5,
                thumbnail: true,
                cropOptions: {
                  aspect: 16/9,
                  quality: 0.8
                }
              }
            }
          ]
        }
      ]
    },

    // 维修记录表格
    tables: [
      {
        key: "repairs",
        title: "维修记录",
        icon: "mdi:tools",
        description: "记录维修过程和使用的配件",
        config: {
          columns: [
            {
              key: "repairDate",
              title: "维修日期",
              type: "date",
              width: "150px",
              required: true
            },
            {
              key: "repairer",
              title: "维修人员",
              type: "resource",
              width: "200px",
              required: true,
              resourceConfig: {
                resourceId: "resource_employee",
                displayFields: [
                  { key: "name", label: "姓名" },
                  { key: "skillLevel", label: "技能等级" }
                ]
              }
            },
            {
              key: "repairMethod",
              title: "维修方法",
              type: "textarea",
              width: "300px",
              required: true
            },
            {
              key: "sparePartUsed",
              title: "使用配件",
              type: "resource",
              width: "200px",
              resourceConfig: {
                resourceId: "resource_spare_part",
                multiple: true,
                displayFields: [
                  { key: "code", label: "配件编号" },
                  { key: "name", label: "配件名称" }
                ]
              }
            },
            {
              key: "repairResult",
              title: "维修结果",
              type: "select",
              width: "150px",
              required: true,
              options: [
                { label: "已修复", value: "fixed" },
                { label: "部分修复", value: "partial" },
                { label: "未修复", value: "unfixed" },
                { label: "需要更换", value: "replace" }
              ]
            },
            {
              key: "workHours",
              title: "工时",
              type: "number",
              width: "100px",
              required: true,
              validators: [
                (value) => {
                  if (value <= 0) return "工时必须大于0"
                  return undefined
                }
              ]
            },
            {
              key: "cost",
              title: "维修费用",
              type: "number",
              width: "150px",
              className: "text-right",
              editable: false,
              render: (_, record) => {
                const cost = (record.workHours || 0) * 100 // 假设每小时100元
                return `¥${cost.toFixed(2)}`
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
    ],

    // 维修流程步骤
    processSteps: [
      {
        key: "register",
        title: "故障登记",
        icon: "mdi:clipboard-text",
        fields: [
          {
            name: "reporter",
            label: "报修人",
            type: "resource",
            required: true,
            resourceConfig: {
              resourceId: "resource_employee",
              displayFields: [
                { key: "name", label: "姓名" },
                { key: "department", label: "部门" }
              ]
            }
          },
          {
            name: "reportDate",
            label: "报修时间",
            type: "datetime",
            required: true
          }
        ]
      },
      {
        key: "assign",
        title: "维修分派",
        icon: "mdi:account-hard-hat",
        fields: [
          {
            name: "mainRepairer",
            label: "主要维修人员",
            type: "resource",
            required: true,
            resourceConfig: {
              resourceId: "resource_employee",
              displayFields: [
                { key: "name", label: "姓名" },
                { key: "skillLevel", label: "技能等级" }
              ]
            }
          },
          {
            name: "assistRepairers",
            label: "协助维修人员",
            type: "resource",
            resourceConfig: {
              resourceId: "resource_employee",
              multiple: true,
              displayFields: [
                { key: "name", label: "姓名" },
                { key: "skillLevel", label: "技能等级" }
              ]
            }
          },
          {
            name: "plannedStartDate",
            label: "计划开始时间",
            type: "datetime",
            required: true
          },
          {
            name: "assignComment",
            label: "分派说明",
            type: "textarea"
          }
        ],
        dependencies: [
          {
            step: "register",
            message: "请先完成故障登记"
          }
        ]
      },
      {
        key: "repair",
        title: "维修确认",
        icon: "mdi:wrench",
        fields: [
          {
            name: "actualStartDate",
            label: "实际开始时间",
            type: "datetime",
            required: true
          },
          {
            name: "actualEndDate",
            label: "实际完成时间",
            type: "datetime",
            required: true
          },
          {
            name: "repairSummary",
            label: "维修总结",
            type: "textarea",
            required: true
          },
          {
            name: "repairImages",
            label: "维修照片",
            type: "upload",
            uploadConfig: {
              uploadType: "image",
              multiple: true,
              maxSize: 5 * 1024 * 1024,
              maxCount: 5,
              thumbnail: true
            }
          },
          {
            name: "repairerSignature",
            label: "维修人员签名",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ],
        dependencies: [
          {
            step: "assign",
            message: "请先完成维修分派"
          }
        ]
      },
      {
        key: "quality",
        title: "质量检查",
        icon: "mdi:checkbox-marked-circle",
        fields: [
          {
            name: "checkItems",
            label: "检查项目",
            type: "checkbox",
            required: true,
            options: [
                { label: "功能正常", value: "function" },
                { label: "性能达标", value: "performance" },
                { label: "安全可靠", value: "safety" },
                { label: "外观完好", value: "appearance" }
            ]
          },
          {
            name: "testResult",
            label: "测试结果",
            type: "textarea",
            required: true
          },
          {
            name: "qualityLevel",
            label: "维修质量评级",
            type: "radio",
            required: true,
            options: [
                { label: "优秀", value: "excellent" },
                { label: "合格", value: "qualified" },
                { label: "需要返修", value: "rework" }
            ]
          },
          {
            name: "inspectorSignature",
            label: "检查人员签名",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ],
        dependencies: [
          {
            step: "repair",
            message: "请先完成维修确认"
          }
        ]
      },
      {
        key: "acceptance",
        title: "验收确认",
        icon: "mdi:check-circle",
        fields: [
          {
            name: "acceptanceResult",
            label: "验收结果",
            type: "radio",
            required: true,
            options: [
                { label: "通过", value: "pass" },
                { label: "有条件通过", value: "conditional" },
                { label: "不通过", value: "fail" }
            ]
          },
          {
            name: "acceptanceComment",
            label: "验收意见",
            type: "textarea",
            required: true
          },
          {
            name: "userSignature",
            label: "用户签名",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ],
        dependencies: [
          {
            step: "quality",
            message: "请先完成质量检查"
          }
        ]
      }
    ]
  },

  // 工单编号配置
  orderNumberConfig: {
    prefix: "MR",
    fieldName: "orderNumber",
    label: "维修工单编号"
  },

  // 表单验证
  validate: async (values) => {
    const errors = []

    // 验证维修记录
    const repairs = values.tableData?.repairs || []
    if (repairs.length === 0) {
      errors.push("至少需要添加一条维修记录")
    }

    // 验证维修时间
    if (values.actualStartDate && values.actualEndDate) {
      if (new Date(values.actualEndDate) <= new Date(values.actualStartDate)) {
        errors.push("实际完成时间必须晚于开始时间")
      }
    }

    // 验证质量检查
    const qualityCheck = values.processConfirmations?.quality
    if (qualityCheck?.formData?.qualityLevel === "rework") {
      if (values.processConfirmations?.acceptance?.formData?.acceptanceResult === "pass") {
        errors.push("需要返修的维修工单不能直接通过验收")
      }
    }

    // 验证紧急程度对应的处理时间
    if (values.urgency === "critical") {
      const reportDate = new Date(values.processConfirmations?.register?.formData?.reportDate)
      const startDate = new Date(values.processConfirmations?.repair?.formData?.actualStartDate)
      const hours = Math.floor((startDate.getTime() - reportDate.getTime()) / (1000 * 60 * 60))
      if (hours > 2) {
        errors.push("特急维修工单必须在2小时内开始处理")
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      fields: {}
    }
  },

  // 表单联动
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 监听维修记录变化，自动计算费用
      if (name?.startsWith("tableData.repairs") && name?.endsWith(".workHours")) {
        const repairs = form.getValues("tableData.repairs") || []
        repairs.forEach((item, index) => {
          const cost = (item.workHours || 0) * 100 // 每小时100元
          form.setValue(`tableData.repairs.${index}.cost`, cost)
        })
      }

      // 监听紧急程度变化
      if (name === "urgency") {
        const urgency = form.getValues("urgency")
        // 特急工单自动选择最高技能等级的维修人员
        if (urgency === "critical") {
          form.setValue("mainRepairer.required", true)
        }
      }

      // 监听质量检查结果
      if (name?.startsWith("processConfirmations.quality.formData.qualityLevel")) {
        const qualityLevel = form.getValues("processConfirmations.quality.formData.qualityLevel")
        if (qualityLevel === "rework") {
          // 需要返修时重置验收结果
          form.setValue("processConfirmations.acceptance.formData.acceptanceResult", undefined)
        }
      }
    })

    return () => subscription.unsubscribe()
  }
}
```

## 3. 使用说明

以上配置示例展示了 DynamicForm 组件的主要功能和使用方法：

1. 基础信息配置

- 使用分组展示相关字段
- 支持字段间的联动
- 支持字段值的自动填充

2. 表格配置

- 支持多个关联表格
- 支持复杂的字段映射
- 支持自动计算和汇总

3. 流程步骤配置

- 支持步骤依赖关系
- 支持复杂的表单验证
- 支持多人协作流程

4. 注意事项

- 合理使用字段映射功能
- 注意处理表单验证和联动
- 合理设置字段的必填和权限
- 注意处理异常情况
