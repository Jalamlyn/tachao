# 流程验证

## 基础验证
```typescript
{
  processSteps: [
    {
      key: "step1",
      title: "步骤1",
      fields: [
        {
          name: "field1",
          label: "字段1",
          type: "text",
          required: true,
          validators: [
            (value) => {
              if (!value) return "该字段不能为空"
            }
          ]
        }
      ]
    }
  ]
}
```
基础的字段验证配置。

## 自定义验证
```typescript
{
  processSteps: [
    {
      key: "step1",
      title: "步骤1",
      fields: [
        {
          name: "startDate",
          label: "开始日期",
          type: "date"
        },
        {
          name: "endDate",
          label: "结束日期",
          type: "date",
          validators: [
            (value, formData) => {
              if (value && formData.startDate && value < formData.startDate) {
                return "结束日期不能早于开始日期"
              }
            }
          ]
        }
      ]
    }
  ]
}
```
支持自定义验证逻辑。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "流程验证示例"
  },
  renderConfig: {
    processSteps: [
      {
        key: "basicInfo",
        title: "基本信息",
        icon: "mdi:form-textbox",
        fields: [
          {
            name: "name",
            label: "姓名",
            type: "text",
            required: true,
            validators: [
              (value) => {
                if (!value) return "姓名不能为空"
                if (value.length < 2) return "姓名至少2个字符"
              }
            ]
          },
          {
            name: "phone",
            label: "手机号",
            type: "text",
            required: true,
            validators: [
              (value) => {
                if (!value) return "手机号不能为空"
                if (!/^1[3-9]\d{9}$/.test(value)) {
                  return "请输入有效的手机号"
                }
              }
            ]
          },
          {
            name: "email",
            label: "邮箱",
            type: "text",
            required: true,
            validators: [
              (value) => {
                if (!value) return "邮箱不能为空"
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return "请输入有效的邮箱地址"
                }
              }
            ]
          }
        ]
      },
      {
        key: "leaveInfo",
        title: "请假信息",
        icon: "mdi:calendar",
        fields: [
          {
            name: "leaveType",
            label: "请假类型",
            type: "select",
            required: true,
            options: [
              { label: "年假", value: "annual" },
              { label: "病假", value: "sick" },
              { label: "事假", value: "personal" }
            ]
          },
          {
            name: "startDate",
            label: "开始日期",
            type: "date",
            required: true,
            validators: [
              (value) => {
                if (!value) return "开始日期不能为空"
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                if (new Date(value) < today) {
                  return "开始日期不能早于今天"
                }
              }
            ]
          },
          {
            name: "endDate",
            label: "结束日期",
            type: "date",
            required: true,
            validators: [
              (value, formData) => {
                if (!value) return "结束日期不能为空"
                if (value && formData.startDate && value < formData.startDate) {
                  return "结束日期不能早于开始日期"
                }
              }
            ]
          },
          {
            name: "duration",
            label: "请假天数",
            type: "number",
            required: true,
            validators: [
              (value, formData) => {
                if (!value) return "请假天数不能为空"
                if (value <= 0) return "请假天数必须大于0"
                if (formData.leaveType === "annual" && value > 5) {
                  return "年假一次最多请5天"
                }
              }
            ]
          }
        ]
      },
      {
        key: "reason",
        title: "请假原因",
        icon: "mdi:text-box",
        fields: [
          {
            name: "reason",
            label: "请假原因",
            type: "textarea",
            required: true,
            validators: [
              (value) => {
                if (!value) return "请假原因不能为空"
                if (value.length < 10) return "请假原因至少10个字符"
                if (value.length > 500) return "请假原因最多500个字符"
              }
            ]
          },
          {
            name: "attachment",
            label: "附件",
            type: "upload",
            validators: [
              (value, formData) => {
                if (formData.leaveType === "sick" && !value) {
                  return "病假必须上传医院证明"
                }
              }
            ],
            uploadConfig: {
              maxSize: 5242880, // 5MB
              accept: ".pdf,.jpg,.png"
            }
          }
        ]
      }
    ]
  },
  validate: async (values) => {
    // 表单级验证
    const errors = []
    
    // 验证请假时间是否有冲突
    try {
      const response = await checkLeaveConflict(values.startDate, values.endDate)
      if (response.hasConflict) {
        errors.push("该时间段已有其他请假申请")
      }
    } catch (error) {
      console.error("Check leave conflict failed:", error)
      errors.push("验证请假时间失败")
    }

    // 验证年假余额
    if (values.leaveType === "annual") {
      try {
        const balance = await checkAnnualLeaveBalance()
        if (balance < values.duration) {
          errors.push(`年假余额不足，当前余额${balance}天`)
        }
      } catch (error) {
        console.error("Check annual leave balance failed:", error)
        errors.push("验证年假余额失败")
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors
      }
    }

    return {
      valid: true
    }
  }
}
```