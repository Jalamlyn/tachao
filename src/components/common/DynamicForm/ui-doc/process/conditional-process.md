# 条件流程

## 基础条件流程
```typescript
{
  processSteps: [
    {
      key: "apply",
      title: "申请",
      fields: [
        {
          name: "amount",
          label: "金额",
          type: "number"
        }
      ]
    },
    {
      key: "managerApproval",
      title: "经理审批",
      showWhen: {
        field: "amount",
        value: 10000,
        operator: "lt"
      }
    },
    {
      key: "directorApproval",
      title: "总监审批",
      showWhen: {
        field: "amount",
        value: 10000,
        operator: "gte"
      }
    }
  ]
}
```
基础的条件流程配置。

## 复杂条件流程
```typescript
{
  processSteps: [
    {
      key: "submit",
      title: "提交",
      fields: [
        {
          name: "type",
          label: "类型",
          type: "select",
          options: [
            { label: "请假", value: "leave" },
            { label: "报销", value: "expense" }
          ]
        }
      ]
    },
    {
      key: "leaveApproval",
      title: "请假审批",
      showWhen: {
        field: "type",
        value: "leave"
      },
      fields: [
        {
          name: "leaveDays",
          label: "请假天数",
          type: "number"
        }
      ]
    },
    {
      key: "expenseApproval",
      title: "报销审批",
      showWhen: {
        field: "type",
        value: "expense"
      },
      fields: [
        {
          name: "expenseAmount",
          label: "报销金额",
          type: "number"
        }
      ]
    }
  ]
}
```
支持复杂的条件判断。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "条件流程示例"
  },
  renderConfig: {
    processSteps: [
      {
        key: "initiate",
        title: "发起申请",
        icon: "mdi:file-plus",
        fields: [
          {
            name: "applicationType",
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
          }
        ]
      },
      {
        key: "leaveProcess",
        title: "请假流程",
        icon: "mdi:calendar-clock",
        showWhen: {
          field: "applicationType",
          value: "leave"
        },
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
            name: "leaveDuration",
            label: "请假时长",
            type: "number",
            required: true
          }
        ]
      },
      {
        key: "expenseProcess",
        title: "报销流程",
        icon: "mdi:cash",
        showWhen: {
          field: "applicationType",
          value: "expense"
        },
        fields: [
          {
            name: "expenseType",
            label: "报销类型",
            type: "select",
            required: true,
            options: [
              { label: "差旅费", value: "travel" },
              { label: "办公用品", value: "office" },
              { label: "其他", value: "other" }
            ]
          },
          {
            name: "expenseAmount",
            label: "报销金额",
            type: "number",
            required: true
          }
        ]
      },
      {
        key: "purchaseProcess",
        title: "采购流程",
        icon: "mdi:cart",
        showWhen: {
          field: "applicationType",
          value: "purchase"
        },
        fields: [
          {
            name: "purchaseType",
            label: "采购类型",
            type: "select",
            required: true,
            options: [
              { label: "设备", value: "equipment" },
              { label: "耗材", value: "consumables" },
              { label: "服务", value: "service" }
            ]
          },
          {
            name: "purchaseAmount",
            label: "采购金额",
            type: "number",
            required: true
          }
        ]
      },
      {
        key: "urgentApproval",
        title: "加急审批",
        icon: "mdi:flash",
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
          }
        ]
      },
      {
        key: "normalApproval",
        title: "普通审批",
        icon: "mdi:check",
        showWhen: {
          field: "urgencyLevel",
          value: "normal"
        },
        fields: [
          {
            name: "approvalComments",
            label: "审批意见",
            type: "textarea"
          }
        ]
      }
    ]
  }
}
```