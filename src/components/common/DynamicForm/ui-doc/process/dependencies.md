# 流程依赖关系

## 基础依赖
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
          type: "text"
        }
      ]
    },
    {
      key: "step2",
      title: "步骤2",
      dependencies: [
        {
          step: "step1"
        }
      ]
    }
  ]
}
```
基础的步骤依赖配置。

## 条件依赖
```typescript
{
  processSteps: [
    {
      key: "review",
      title: "审核",
      fields: [
        {
          name: "result",
          label: "审核结果",
          type: "select",
          options: [
            { label: "通过", value: "pass" },
            { label: "拒绝", value: "reject" }
          ]
        }
      ]
    },
    {
      key: "approve",
      title: "批准",
      dependencies: [
        {
          step: "review",
          condition: {
            field: "result",
            value: "pass"
          }
        }
      ]
    }
  ]
}
```
支持基于字段值的条件依赖。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "流程依赖示例"
  },
  renderConfig: {
    processSteps: [
      {
        key: "submit",
        title: "提交申请",
        icon: "mdi:file-document-edit",
        fields: [
          {
            name: "type",
            label: "申请类型",
            type: "select",
            required: true,
            options: [
              { label: "一般申请", value: "normal" },
              { label: "紧急申请", value: "urgent" }
            ]
          },
          {
            name: "amount",
            label: "申请金额",
            type: "number",
            required: true
          }
        ]
      },
      {
        key: "departmentReview",
        title: "部门审核",
        icon: "mdi:account-check",
        dependencies: [
          {
            step: "submit",
            condition: {
              field: "amount",
              value: 10000,
              operator: "lt"
            },
            message: "金额超过10000需要总监审核"
          }
        ],
        fields: [
          {
            name: "departmentResult",
            label: "部门审核结果",
            type: "select",
            required: true,
            options: [
              { label: "通过", value: "pass" },
              { label: "拒绝", value: "reject" }
            ]
          },
          {
            name: "departmentComments",
            label: "部门审核意见",
            type: "textarea"
          }
        ]
      },
      {
        key: "directorReview",
        title: "总监审核",
        icon: "mdi:account-tie",
        dependencies: [
          {
            step: "submit",
            condition: {
              field: "amount",
              value: 10000,
              operator: "gte"
            }
          }
        ],
        fields: [
          {
            name: "directorResult",
            label: "总监审核结果",
            type: "select",
            required: true,
            options: [
              { label: "通过", value: "pass" },
              { label: "拒绝", value: "reject" }
            ]
          },
          {
            name: "directorComments",
            label: "总监审核意见",
            type: "textarea"
          }
        ]
      },
      {
        key: "urgentProcess",
        title: "加急处理",
        icon: "mdi:flash",
        dependencies: [
          {
            step: "submit",
            condition: {
              field: "type",
              value: "urgent"
            }
          },
          {
            step: "departmentReview",
            condition: {
              field: "departmentResult",
              value: "pass"
            }
          }
        ],
        fields: [
          {
            name: "urgentHandler",
            label: "加急处理人",
            type: "text",
            required: true
          },
          {
            name: "urgentComments",
            label: "加急处理意见",
            type: "textarea"
          }
        ]
      },
      {
        key: "finalApproval",
        title: "最终审批",
        icon: "mdi:gavel",
        dependencies: [
          {
            step: "departmentReview",
            condition: {
              custom: (data) => data.departmentResult === "pass"
            }
          },
          {
            step: "directorReview",
            condition: {
              custom: (data) => !data || data.directorResult === "pass"
            }
          }
        ],
        fields: [
          {
            name: "finalResult",
            label: "最终审批结果",
            type: "select",
            required: true,
            options: [
              { label: "通过", value: "pass" },
              { label: "拒绝", value: "reject" }
            ]
          },
          {
            name: "finalComments",
            label: "最终审批意见",
            type: "textarea"
          }
        ]
      }
    ]
  }
}
```