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
