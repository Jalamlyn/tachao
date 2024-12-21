# 流程联动

## 基础流程联动
```typescript
{
  processSteps: [
    {
      key: "step1",
      title: "步骤1",
      fields: [
        {
          name: "result",
          label: "结果",
          type: "select",
          options: [
            { label: "通过", value: "pass" },
            { label: "拒绝", value: "reject" }
          ]
        }
      ]
    },
    {
      key: "step2",
      title: "步骤2",
      showWhen: {
        field: "step1.result",
        value: "pass"
      }
    }
  ]
}
```
基础的流程步骤联动。

## 复杂流程联动
```typescript
{
  processSteps: [
    {
      key: "apply",
      title: "申请",
      fields: [
        {
          name: "type",
          label: "类型",
          type: "select",
          options: [
            { label: "类型A", value: "A" },
            { label: "类型B", value: "B" }
          ]
        },
        {
          name: "amount",
          label: "金额",
          type: "number"
        }
      ]
    },
    {
      key: "review",
      title: "审核",
      showWhen: {
        field: "apply.type",
        value: "A",
        operator: "eq"
      }
    },
    {
      key: "approve",
      title: "审批",
      showWhen: {
        field: "apply.amount",
        value: 10000,
        operator: "gte"
      }
    }
  ]
}
```
支持复杂的流程控制。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "流程联动示例"
  },
  renderConfig: {
    processSteps: [
      {
        key: "initiate",
        title: "发起申请",
        icon: "mdi:file-document-edit",
        fields: [
          {
            name: "type",
            label: "申请类型",
            type: "select",
            required: true,
            options: [
              { label: "请假申请", value: "leave" },
              { label: "报销申请", value: "expense" },
              { label: "采购申请", value: "purchase" }
            ]
          },
          {
            name: "urgencyLevel",
            label: "紧急程度",
            type: "select",
            required: true,
            options: [
              { label: "普通", value: "normal" },
              { label: "紧急", value: "urgent" },
              { label: "特急", value: "critical" }
            ]
          },
          {
            name: "amount",
            label: "申请金额",
            type: "number",
            required: true,
            showWhen: {
              field: "type",
              value: ["expense", "purchase"],
              operator: "in"
            },
            formatConfig: {
              type: "currency",
              options: { currency: "CNY", precision: 2 }
            }
          },
          {
            name: "days",
            label: "请假天数",
            type: "number",
            required: true,
            showWhen: {
              field: "type",
              value: "leave"
            }
          }
        ]
      },
      {
        key: "departmentReview",
        title: "部门审核",
        icon: "mdi:account-check",
        description: "部门主管审核",
        fields: [
          {
            name: "departmentOpinion",
            label: "审核意见",
            type: "textarea",
            required: true
          },
          {
            name: "departmentResult",
            label: "审核结果",
            type: "select",
            required: true,
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" }
            ]
          }
        ]
      },
      {
        key: "hrReview",
        title: "人事审核",
        icon: "mdi:account-tie",
        description: "人事部门审核",
        showWhen: {
          field: "type",
          value: "leave"
        },
        fields: [
          {
            name: "leaveBalance",
            label: "休假余额",
            type: "number",
            disabled: true,
            compute: async (data) => {
              // 模拟获取休假余额
              return 10
            }
          },
          {
            name: "hrOpinion",
            label: "审核意见",
            type: "textarea",
            required: true
          },
          {
            name: "hrResult",
            label: "审核结果",
            type: "select",
            required: true,
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" }
            ]
          }
        ]
      },
      {
        key: "financeReview",
        title: "财务审核",
        icon: "mdi:cash",
        description: "财务部门审核",
        showWhen: {
          field: "type",
          value: ["expense", "purchase"],
          operator: "in"
        },
        fields: [
          {
            name: "budgetCheck",
            label: "预算检查",
            type: "switch",
            required: true
          },
          {
            name: "financeOpinion",
            label: "审核意见",
            type: "textarea",
            required: true
          },
          {
            name: "financeResult",
            label: "审核结果",
            type: "select",
            required: true,
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" }
            ]
          }
        ]
      },
      {
        key: "urgentProcess",
        title: "加急处理",
        icon: "mdi:flash",
        description: "紧急申请特殊处理",
        showWhen: {
          field: "urgencyLevel",
          value: ["urgent", "critical"],
          operator: "in"
        },
        fields: [
          {
            name: "urgentReason",
            label: "加急原因",
            type: "textarea",
            required: true
          },
          {
            name: "urgentHandler",
            label: "加急处理人",
            type: "text",
            required: true
          }
        ]
      },
      {
        key: "finalApproval",
        title: "最终审批",
        icon: "mdi:gavel",
        description: "总经理审批",
        showWhen: {
          field: "amount",
          value: 10000,
          operator: "gte"
        },
        fields: [
          {
            name: "finalOpinion",
            label: "审批意见",
            type: "textarea",
            required: true
          },
          {
            name: "finalResult",
            label: "审批结果",
            type: "select",
            required: true,
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" }
            ]
          }
        ]
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 监听申请类型变化
      if (name === "type") {
        // 清空相关字段
        form.setValue("amount", null)
        form.setValue("days", null)
      }
      
      // 监听审核结果
      if (name?.endsWith("Result")) {
        const result = value
        if (result === "reject") {
          // 如果任何步骤被拒绝，后续步骤都不显示
          const steps = ["departmentReview", "hrReview", "financeReview", "finalApproval"]
          const currentStep = name.split(".")[0]
          const currentIndex = steps.indexOf(currentStep)
          
          if (currentIndex !== -1) {
            steps.slice(currentIndex + 1).forEach(step => {
              form.setValue(`${step}.Result`, null)
            })
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }
}
```