# DynamicForm 资产管理表单配置示例

本文档提供了一个完整的资产管理表单配置示例，展示了 DynamicForm 组件的主要功能和配置方法。这个示例包含了基本信息分组、表格配置、流程步骤、字段联动等特性，可以作为开发其他表单的参考。

## 完整配置代码

```mo
<shata-ai-form>
export default {
config:{
  // 表单元数据配置
  metadata: {
    title: "资产管理表单",
    description: "用于资产登记、领用、维护及处置的综合表单",
    permissions: {
      edit: true,
      delete: true,
      print: true,
    },
  },

  // 表单渲染配置
  renderConfig: {
    // 基础字段配置 - 使用分组
    basicFields: {
      groups: [
        {
          key: "asset-info",
          title: "资产信息",
          icon: "mdi:package-variant",
          description: "资产的基本信息",
          fields: [
            {
              name: "assetCode",
              label: "资产编号",
              type: "text",
              disabled: true, // 自动生成
              required: true,
            },
            {
              name: "assetName",
              label: "资产名称",
              type: "text",
              required: true,
            },
            {
              name: "assetType",
              label: "资产类别",
              type: "select",
              required: true,
              options: [
                { label: "固定资产", value: "fixed" },
                { label: "低值易耗品", value: "consumable" },
                { label: "无形资产", value: "intangible" },
              ],
            },
            {
              name: "specification",
              label: "规格型号",
              type: "text",
              required: true,
            },
            {
              name: "purchaseDate",
              label: "购置日期",
              type: "date",
              required: true,
            },
            {
              name: "purchaseAmount",
              label: "购置金额",
              type: "number",
              required: true,
            },
            {
              name: "usefulLife",
              label: "使用年限",
              type: "number",
              required: true,
            },
            {
              name: "depreciationMethod",
              label: "折旧方法",
              type: "select",
              options: [
                { label: "年限平均法", value: "straight-line" },
                { label: "工作量法", value: "units-of-production" },
                { label: "双倍余额递减法", value: "double-declining" },
              ],
            },
            {
              name: "salvageRate",
              label: "残值率",
              type: "number",
              // 根据折旧方法联动显示
              showWhen: {
                field: "depreciationMethod",
                value: "straight-line",
              },
            },
            {
              name: "assetStatus",
              label: "资产状态",
              type: "select",
              options: [
                { label: "在用", value: "in-use" },
                { label: "闲置", value: "idle" },
                { label: "维修", value: "maintenance" },
                { label: "报废", value: "scrapped" },
              ],
            },
          ],
        },
        {
          key: "supplier-info",
          title: "供应商信息",
          icon: "mdi:account-tie",
          description: "资产供应商相关信息",
          fields: [
            {
              name: "supplier",
              label: "供应商",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceTitle: "供应商主数据",
                // 新增：允许手动输入配置
                allowManualInput: true,
                manualInputFields: [
                  { key: "name", label: "供应商名称", required: true },
                  { key: "code", label: "供应商编号" },
                  { key: "contact", label: "联系人" },
                  { key: "phone", label: "联系电话", type: "tel" },
                  { key: "address", label: "地址", type: "text" }
                ]
              },
            },
            {
              name: "contractNo",
              label: "合同编号",
              type: "text",
            },
            {
              name: "warrantyPeriod",
              label: "保修期限",
              type: "date",
            },
            {
              name: "maintainContact",
              label: "维保联系人",
              type: "text",
            },
            {
              name: "contactPhone",
              label: "联系电话",
              type: "tel",
            },
            {
              name: "warrantyFile",
              label: "质保文件",
              type: "file",
              accept: ".pdf,.doc,.docx",
            },
          ],
        },
      ],
    },

    // 表格配置
    tables: [
      {
        key: "usage-records",
        title: "资产领用记录",
        icon: "mdi:clipboard-list",
        config: {
          columns: [
            {
              key: "user",
              title: "领用人",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceTitle: "员工主数据",
                allowManualInput: true,
                manualInputFields: [
                  { key: "name", label: "姓名", required: true },
                  { key: "employeeId", label: "工号" },
                  { key: "department", label: "部门" }
                ]
              },
            },
            {
              key: "department",
              title: "所属部门",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceTitle: "部门主数据",
                allowManualInput: true,
                manualInputFields: [
                  { key: "name", label: "部门名称", required: true },
                  { key: "code", label: "部门编码" }
                ]
              },
            },
            {
              key: "useDate",
              title: "领用日期",
              type: "date",
              required: true,
            },
            {
              key: "returnDate",
              title: "预计归还日期",
              type: "date",
            },
            {
              key: "quantity",
              title: "领用数量",
              type: "number",
              required: true,
            },
            {
              key: "purpose",
              title: "领用原因",
              type: "textarea",
            },
            {
              key: "location",
              title: "使用地点",
              type: "text",
            },
            {
              key: "status",
              title: "领用状态",
              type: "select",
              options: [
                { label: "待审批", value: "pending" },
                { label: "已领用", value: "using" },
                { label: "已归还", value: "returned" },
              ],
            },
          ],
          summary: {
            show: true,
            label: "合计",
          },
        },
      },
      {
        key: "maintenance-records",
        title: "资产维护记录",
        icon: "mdi:tools",
        config: {
          columns: [
            {
              key: "maintenanceDate",
              title: "维护日期",
              type: "date",
              required: true,
            },
            {
              key: "maintenanceType",
              title: "维护类型",
              type: "select",
              options: [
                { label: "日常保养", value: "routine" },
                { label: "定期维护", value: "regular" },
                { label: "故障维修", value: "repair" },
              ],
            },
            {
              key: "maintainer",
              title: "维护人员",
              type: "resource",
              resourceConfig: {
                resourceTitle: "员工主数据",
                allowManualInput: true,
                manualInputFields: [
                  { key: "name", label: "姓名", required: true },
                  { key: "employeeId", label: "工号" },
                  { key: "department", label: "部门" },
                  { key: "phone", label: "联系电话", type: "tel" }
                ]
              },
            },
            {
              key: "maintenanceContent",
              title: "维护内容",
              type: "textarea",
              required: true,
            },
            {
              key: "cost",
              title: "维护费用",
              type: "number",
            },
            {
              key: "result",
              title: "维护结果",
              type: "textarea",
            },
            {
              key: "nextMaintenanceDate",
              title: "下次维护日期",
              type: "date",
            },
            {
              key: "attachments",
              title: "相关附件",
              type: "file",
            },
          ],
          summary: {
            show: true,
            label: "费用合计",
          },
        },
      },
    ],

    // 流程步骤配置
    processSteps: [
      {
        key: "disposal-application",
        title: "处置申请",
        icon: "mdi:file-document-edit",
        fields: [
          {
            name: "applicant",
            label: "申请人",
            type: "resource",
            resourceConfig: {
              resourceTitle: "员工主数据",
              allowManualInput: true,
              manualInputFields: [
                { key: "name", label: "姓名", required: true },
                { key: "employeeId", label: "工号" },
                { key: "department", label: "部门" }
              ]
            },
          },
          {
            name: "applicationDate",
            label: "申请日期",
            type: "date",
          },
          {
            name: "disposalType",
            label: "处置类型",
            type: "select",
            required: true,
            options: [
              { label: "报废", value: "scrap" },
              { label: "转让", value: "transfer" },
              { label: "捐赠", value: "donate" },
              { label: "其他", value: "other" },
            ],
          },
          {
            name: "disposalReason",
            label: "处置原因",
            type: "textarea",
            required: true,
          },
          {
            name: "expectedIncome",
            label: "预计处置收益",
            type: "number",
          },
          {
            name: "disposalMethod",
            label: "处置方式",
            type: "select",
            options: [
              { label: "拍卖", value: "auction" },
              { label: "协议转让", value: "agreement" },
              { label: "报废处理", value: "scrap" },
            ],
          },
        ],
      },
      {
        key: "asset-evaluation",
        title: "评估确认",
        icon: "mdi:calculator",
        fields: [
          {
            name: "evaluator",
            label: "评估人",
            type: "resource",
            resourceConfig: {
              resourceTitle: "员工主数据",
              allowManualInput: true,
              manualInputFields: [
                { key: "name", label: "姓名", required: true },
                { key: "employeeId", label: "工号" },
                { key: "department", label: "部门" },
                { key: "qualification", label: "评估资质" }
              ]
            },
          },
          {
            name: "evaluationTime",
            label: "评估时间",
            type: "datetime",
          },
          {
            name: "evaluationValue",
            label: "评估价值",
            type: "number",
          },
          {
            name: "evaluationOpinion",
            label: "评估意见",
            type: "textarea",
          },
          {
            name: "evaluationReport",
            label: "评估报告",
            type: "file",
          },
          {
            name: "evaluationSignature",
            label: "评估签名",
            type: "signature",
          },
        ],
        // 依赖处置申请步骤
        dependencies: [
          {
            step: "disposal-application",
            message: "请先完成处置申请",
          },
        ],
      },
      {
        key: "final-approval",
        title: "最终审批",
        icon: "mdi:gavel",
        fields: [
          {
            name: "approver",
            label: "审批人",
            type: "resource",
            resourceConfig: {
              resourceTitle: "员工主数据",
              allowManualInput: true,
              manualInputFields: [
                { key: "name", label: "姓名", required: true },
                { key: "employeeId", label: "工号" },
                { key: "department", label: "部门" },
                { key: "position", label: "职位" }
              ]
            },
          },
          {
            name: "approvalTime",
            label: "审批时间",
            type: "datetime",
          },
          {
            name: "approvalResult",
            label: "审批结果",
            type: "radio",
            options: [
              { label: "同意", value: "approved" },
              { label: "不同意", value: "rejected" },
            ],
          },
          {
            name: "approvalOpinion",
            label: "审批意见",
            type: "textarea",
          },
          {
            name: "approvalSignature",
            label: "审批签名",
            type: "signature",
          },
        ],
        // 依赖评估确认步骤
        dependencies: [
          {
            step: "asset-evaluation",
            message: "请先完成资产评估",
          },
        ],
      },
    ],
  },

  // 单号生成配置
  orderNumberConfig: {
    prefix: "ZC",
    fieldName: "assetCode",
    label: "资产编号",
  },

  // 表单联动配置
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 折旧方法变化时重新计算残值率
      if (name === "depreciationMethod") {
        const method = value.depreciationMethod
        if (method === "straight-line") {
          form.setValue("salvageRate", 5) // 年限平均法默认5%残值率
        } else if (method === "double-declining") {
          form.setValue("salvageRate", 0) // 双倍余额递减法无残值
        }
      }

      // 购置金额或使用年限变化时计算年折旧额
      if (name === "purchaseAmount" || name === "usefulLife" || name === "salvageRate") {
        const amount = form.getValues("purchaseAmount") || 0
        const years = form.getValues("usefulLife") || 0
        const rate = form.getValues("salvageRate") || 0

        if (amount && years) {
          const salvageValue = amount * (rate / 100)
          const yearlyDepreciation = (amount - salvageValue) / years
          form.setValue("yearlyDepreciation", yearlyDepreciation)
        }
      }

      // 维护记录添加时自动设置下次维护日期
      if (name === "maintenanceRecords") {
        const records = value.maintenanceRecords || []
        const lastRecord = records[records.length - 1]
        if (lastRecord?.maintenanceDate) {
          const nextDate = new Date(lastRecord.maintenanceDate)
          nextDate.setMonth(nextDate.getMonth() + 3) // 默认3个月后维护
          form.setValue(`maintenanceRecords.${records.length - 1}.nextMaintenanceDate`, nextDate.toISOString())
        }
      }
    })

    return () => subscription.unsubscribe()
  },

  // 表单验证配置
  validate: async (values) => {
    const errors: string[] = []

    // 验证购置金额
    if (values.purchaseAmount <= 0) {
      errors.push("购置金额必须大于0")
    }

    // 验证使用年限
    if (values.usefulLife <= 0) {
      errors.push("使用年限必须大于0")
    }

    // 验证领用记录
    if (values.tableData?.length) {
      const hasInvalidQuantity = values.tableData.some((record: any) => record.quantity <= 0)
      if (hasInvalidQuantity) {
        errors.push("领用数量必须大于0")
      }
    }

    // 验证处置申请
    if (values.processConfirmations?.["disposal-application"]?.confirmed) {
      const disposalData = values.processConfirmations["disposal-application"].formData
      if (disposalData.disposalType === "transfer" && !disposalData.expectedIncome) {
        errors.push("转让处置必须填写预计收益")
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
}
}
</shata-ai-form>
```