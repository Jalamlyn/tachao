# 基础字段配置

完整的动态表单配置示例，包含基础字段、布局、流程和联动功能。

```typescript
/**
 * 完整的动态表单配置示例
 * 场景: 员工管理系统
 */
const formConfig = {
  metadata: {
    title: "员工信息管理",
  },
  renderConfig: {
    // 基础字段配置
    basicFields: {
      layout: "tabs",
      groups: [
        // 基础信息组
        {
          key: "basicInfo",
          title: "基本信息",
          icon: "mdi:account",
          fields: [
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true,
              placeholder: "请输入姓名",
              validators: [
                (value) => {
                  if (value && value.length < 2) {
                    return "姓名至少2个字符"
                  }
                },
              ],
            },
            {
              name: "email",
              label: "邮箱",
              type: "text",
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              formatConfig: {
                type: "text",
                format: (value) => value?.toLowerCase(),
              },
              description: "请输入有效的邮箱地址",
            },
            {
              name: "bio",
              label: "个人简介",
              type: "textarea",
              layout: "full-width",
              rows: 4,
              maxLength: 500,
              showCount: true,
              description: "请简要介绍自己",
            },
            {
              name: "avatar",
              label: "头像",
              type: "upload",
              required: true,
              uploadConfig: {
                uploadType: "image",
                maxSize: 2097152,
                maxCount: 1,
                thumbnail: true,
                cropOptions: {
                  aspect: 1,
                  quality: 0.8,
                },
              },
            },
          ],
        },

        // 证件信息组
        {
          key: "identityInfo",
          title: "证件信息",
          icon: "mdi:card-account-details",
          fields: [
            {
              name: "idType",
              label: "证件类型",
              type: "select",
              required: true,
              options: [
                { label: "身份证", value: "id" },
                { label: "护照", value: "passport" },
              ],
            },
            {
              name: "idNumber",
              label: "证件号码",
              type: "text",
              required: true,
              validators: [
                (value, data) => {
                  if (data.idType === "id" && !/^\d{17}[\dX]$/.test(value)) {
                    return "请输入有效的身份证号"
                  }
                },
              ],
            },
          ],
        },

        // 工作信息组
        {
          key: "workInfo",
          title: "工作信息",
          icon: "mdi:briefcase",
          fields: [
            {
              name: "employeeId",
              label: "工号",
              type: "text",
              required: true,
              pattern: /^[A-Z]{2}\d{6}$/,
              description: "格式: 字母前缀+6位数字",
            },
            {
              name: "workType",
              label: "工作类型",
              type: "radio",
              required: true,
              layout: "inline",
              options: [
                { label: "全职", value: "fulltime" },
                { label: "兼职", value: "parttime" },
                { label: "实习", value: "intern" },
              ],
            },
            {
              name: "department",
              label: "所属部门",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceId: "departments",
                displayFields: [
                  { key: "name", label: "部门名称" },
                  { key: "code", label: "部门代码" },
                ],
                displayFormat: (resource) => `${resource.name} (${resource.code})`,
              },
            },
            {
              name: "position",
              label: "职位",
              type: "select",
              required: true,
              options: [
                { label: "初级工程师", value: "junior" },
                { label: "中级工程师", value: "middle" },
                { label: "高级工程师", value: "senior" },
                { label: "技术专家", value: "expert" },
              ],
            },
            {
              name: "supervisor",
              label: "直属主管",
              type: "resource",
              required: true,
              showWhen: {
                field: "department",
                operator: "exists",
              },
              resourceConfig: {
                resourceId: "employees",
                displayFields: [
                  { key: "name", label: "姓名" },
                  { key: "title", label: "职位" },
                ],
                params: (form) => ({
                  departmentId: form.getValues("department")?.id,
                }),
              },
              description: "选择部门后可选择对应部门的主管",
            },
          ],
        },

        // 薪资福利组
        {
          key: "salaryInfo",
          title: "薪资福利",
          icon: "mdi:cash",
          showWhen: {
            field: "position",
            value: ["senior", "expert"],
            operator: "in",
          },
          fields: [
            {
              name: "baseSalary",
              label: "基本工资",
              type: "number",
              required: true,
              disabled: true,
              formatConfig: {
                type: "currency",
                options: {
                  currency: "CNY",
                  precision: 2,
                },
              },
            },
            {
              name: "performanceRatio",
              label: "绩效比例",
              type: "slider",
              layout: "full-width",
              min: 0,
              max: 100,
              step: 5,
              formatConfig: {
                type: "percentage",
                precision: 0,
              },
            },
            {
              name: "benefits",
              label: "福利选项",
              type: "checkbox",
              layout: "full-width",
              options: [
                { label: "社保", value: "insurance" },
                { label: "公积金", value: "fund" },
                { label: "年假", value: "vacation" },
                { label: "餐补", value: "meal" },
                { label: "交通补助", value: "transport" },
              ],
            },
          ],
        },
      ],
    },

    // 表格配置
    tables: [
      {
        key: "salaryDetails",
        title: "薪资明细",
        description: "月度薪资明细记录",
        showWhen: {
          field: "position",
          operator: "exists",
        },
        config: {
          columns: [
            {
              key: "month",
              title: "月份",
              type: "month",
              required: true,
              width: 120,
            },
            {
              key: "basicSalary",
              title: "基本工资",
              type: "number",
              required: true,
              width: 150,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 },
              },
            },
            {
              key: "performance",
              title: "绩效工资",
              type: "number",
              required: true,
              width: 150,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 },
              },
            },
            {
              key: "overtime",
              title: "加班费",
              type: "number",
              width: 150,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 },
              },
            },
            {
              key: "deduction",
              title: "扣除项",
              type: "number",
              width: 150,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 },
              },
            },
            {
              key: "total",
              title: "合计",
              type: "number",
              disabled: true,
              width: 150,
              formatConfig: {
                type: "currency",
                options: { currency: "CNY", precision: 2 },
              },
            },
          ],
        },
      },
    ],

    // 流程步骤配置
    processSteps: [
      {
        key: "create",
        title: "创建申请",
        icon: "mdi:file-document-edit",
        fields: [
          {
            name: "title",
            label: "申请标题",
            type: "text",
            required: true,
          },
          {
            name: "content",
            label: "申请内容",
            type: "textarea",
            required: true,
            layout: "full-width",
            rows: 4,
          },
          {
            name: "attachments",
            label: "附件",
            type: "upload",
            uploadConfig: {
              multiple: true,
              maxCount: 5,
            },
          },
        ],
      },
      {
        key: "departmentReview",
        title: "部门审核",
        icon: "mdi:account-check",
        dependencies: [
          {
            step: "create",
          },
        ],
        fields: [
          {
            name: "departmentManager",
            label: "部门主管",
            type: "text",
            required: true,
          },
          {
            name: "departmentOpinion",
            label: "审核意见",
            type: "textarea",
            required: true,
            layout: "full-width",
          },
          {
            name: "departmentResult",
            label: "审核结果",
            type: "radio",
            required: true,
            layout: "inline",
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" },
            ],
          },
        ],
      },
      {
        key: "finalApproval",
        title: "最终审批",
        icon: "mdi:gavel",
        dependencies: [
          {
            step: "departmentReview",
            condition: {
              field: "departmentResult",
              value: "approve",
            },
          },
        ],
        fields: [
          {
            name: "manager",
            label: "总经理",
            type: "text",
            required: true,
          },
          {
            name: "approvalOpinion",
            label: "审批意见",
            type: "textarea",
            required: true,
            layout: "full-width",
          },
          {
            name: "approvalResult",
            label: "审批结果",
            type: "radio",
            required: true,
            layout: "inline",
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" },
            ],
          },
        ],
      },
      {
        key: "complete",
        title: "完成",
        icon: "mdi:check-circle",
        dependencies: [
          {
            step: "finalApproval",
            condition: {
              field: "approvalResult",
              value: "approve",
            },
          },
        ],
        fields: [
          {
            name: "completeDate",
            label: "完成日期",
            type: "date",
            required: true,
          },
          {
            name: "remark",
            label: "备注",
            type: "textarea",
            layout: "full-width",
          },
        ],
      },
    ],

    // 汇总配置
    summaryGroups: [
      {
        key: "salarySummary",
        title: "薪资统计",
        showWhen: {
          field: "tableData.salaryDetails",
          operator: "hasData",
        },
        fields: [
          {
            name: "totalBasicSalary",
            label: "基本工资合计",
            type: "number",
            disabled: true,
            formatConfig: {
              type: "currency",
              options: { currency: "CNY", precision: 2 },
            },
          },
          {
            name: "totalPerformance",
            label: "绩效工资合计",
            type: "number",
            disabled: true,
            formatConfig: {
              type: "currency",
              options: { currency: "CNY", precision: 2 },
            },
          },
          {
            name: "totalAmount",
            label: "总计金额",
            type: "number",
            disabled: true,
            style: {
              sm: { width: "100%" },
              md: { width: "200px" },
            },
            formatConfig: {
              type: "currency",
              options: { currency: "CNY", precision: 2 },
            },
          },
        ],
      },
    ],
  },
  
  watch: (form) => {
    let isCalculating = false
    let timer: any

    const calculate = () => {
      if (isCalculating) return
      isCalculating = true

      try {
        // 1. 基础字段联动
        const position = form.getValues("position")
        const workType = form.getValues("workType")

        // 根据职位和工作类型联动基本工资
        if (position && workType) {
          const baseSalaryMap = {
            junior: { fulltime: 8000, parttime: 4000, intern: 3000 },
            middle: { fulltime: 15000, parttime: 7500, intern: 5000 },
            senior: { fulltime: 25000, parttime: 12500, intern: 8000 },
            expert: { fulltime: 35000, parttime: 17500, intern: 12000 },
          }
          form.setValue("baseSalary", baseSalaryMap[position]?.[workType] || 0)
        }

        // 证件类型联动
        const idType = form.getValues("idType")
        if (idType) {
          // 切换证件类型时清空证件号码
          form.setValue("idNumber", "")
        }

        // 2. 表格计算
        const salaryDetails = form.getValues("tableData.salaryDetails") || []
        salaryDetails.forEach((row, index) => {
          if (!row) return

          // 计算每行合计
          const basicSalary = Number(row.basicSalary) || 0
          const performance = Number(row.performance) || 0
          const overtime = Number(row.overtime) || 0
          const deduction = Number(row.deduction) || 0

          const total = basicSalary + performance + overtime - deduction
          form.setValue(`tableData.salaryDetails.${index}.total`, total.toFixed(2))
        })

        // 3. 汇总计算
        const totalBasicSalary = salaryDetails.reduce((sum, row) => sum + (Number(row.basicSalary) || 0), 0)
        const totalPerformance = salaryDetails.reduce((sum, row) => sum + (Number(row.performance) || 0), 0)
        const totalAmount = salaryDetails.reduce((sum, row) => sum + (Number(row.total) || 0), 0)

        form.setValue("totalBasicSalary", totalBasicSalary.toFixed(2))
        form.setValue("totalPerformance", totalPerformance.toFixed(2))
        form.setValue("totalAmount", totalAmount.toFixed(2))

        // 4. 流程处理
        const departmentResult = form.getValues("departmentResult")
        if (departmentResult === "reject") {
          // 部门拒绝则终止流程
          form.setStepVisible("finalApproval", false)
          form.setStepVisible("complete", false)
        }

        const approvalResult = form.getValues("approvalResult")
        if (approvalResult === "approve") {
          // 验证必要字段
          const requiredFields = ["manager", "approvalOpinion"]
          requiredFields.forEach((field) => {
            if (!form.getValues(field)) {
              throw new Error(`${field} is required`)
            }
          })
        }
      } finally {
        isCalculating = false
      }
    }

    const subscription = form.watch((value, { name }) => {
      clearTimeout(timer)
      timer = setTimeout(calculate, 300)
    })

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  },
  validate: async (values) => {
    const errors = []

    // 1. 基础验证
    if (!values.title) {
      errors.push("申请标题不能为空")
    }

    // 2. 流程验证
    if (values.departmentResult === "approve" && !values.departmentOpinion) {
      errors.push("审批同意时必须填写审核意见")
    }

    // 3. 业务规则验证
    if (values.totalAmount > 50000) {
      try {
        // 调用外部服务验证
        const valid = await validateHighAmount(values.totalAmount)
        if (!valid) {
          errors.push("超过金额限制，需要特殊审批")
        }
      } catch (error) {
        errors.push("金额验证失败")
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
      }
    }

    return {
      valid: true,
    }
  },
}
```
