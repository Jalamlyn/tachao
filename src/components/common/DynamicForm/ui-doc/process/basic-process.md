# 基础流程

## 简单流程
```typescript
{
  processSteps: [
    {
      key: "create",
      title: "创建",
      fields: [
        {
          name: "creator",
          label: "创建人",
          type: "text"
        }
      ]
    },
    {
      key: "review",
      title: "审核",
      fields: [
        {
          name: "reviewer",
          label: "审核人",
          type: "text"
        }
      ]
    }
  ]
}
```
基础的流程步骤配置。

## 带描述的流程
```typescript
{
  processSteps: [
    {
      key: "submit",
      title: "提交",
      description: "提交申请信息",
      icon: "mdi:send",
      fields: [
        {
          name: "submitter",
          label: "提交人",
          type: "text"
        },
        {
          name: "submitDate",
          label: "提交日期",
          type: "date"
        }
      ]
    }
  ]
}
```
支持图标和描述信息。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "基础流程示例"
  },
  renderConfig: {
    processSteps: [
      {
        key: "create",
        title: "创建申请",
        description: "填写基本申请信息",
        icon: "mdi:file-document-edit",
        fields: [
          {
            name: "title",
            label: "申请标题",
            type: "text",
            required: true
          },
          {
            name: "content",
            label: "申请内容",
            type: "textarea",
            required: true,
            rows: 4
          },
          {
            name: "attachments",
            label: "附件",
            type: "upload",
            uploadConfig: {
              multiple: true,
              maxCount: 5
            }
          }
        ]
      },
      {
        key: "departmentReview",
        title: "部门审核",
        description: "部门主管审核",
        icon: "mdi:account-check",
        fields: [
          {
            name: "departmentManager",
            label: "部门主管",
            type: "text",
            required: true
          },
          {
            name: "departmentOpinion",
            label: "审核意见",
            type: "textarea",
            required: true
          },
          {
            name: "departmentResult",
            label: "审核结果",
            type: "radio",
            required: true,
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" }
            ]
          }
        ]
      },
      {
        key: "finalApproval",
        title: "最终审批",
        description: "总经理审批",
        icon: "mdi:gavel",
        fields: [
          {
            name: "manager",
            label: "总经理",
            type: "text",
            required: true
          },
          {
            name: "approvalOpinion",
            label: "审批意见",
            type: "textarea",
            required: true
          },
          {
            name: "approvalResult",
            label: "审批结果",
            type: "radio",
            required: true,
            options: [
              { label: "同意", value: "approve" },
              { label: "拒绝", value: "reject" }
            ]
          }
        ]
      },
      {
        key: "complete",
        title: "完成",
        description: "申请完成",
        icon: "mdi:check-circle",
        fields: [
          {
            name: "completeDate",
            label: "完成日期",
            type: "date",
            required: true
          },
          {
            name: "remark",
            label: "备注",
            type: "textarea"
          }
        ]
      }
    ]
  }
}
```