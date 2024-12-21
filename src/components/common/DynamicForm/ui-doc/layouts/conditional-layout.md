# 条件显示布局

## 基础条件显示
```typescript
{
  name: "conditionalField",
  label: "条件字段",
  type: "text",
  showWhen: {
    field: "controlField",
    value: true
  }
}
```
根据其他字段值控制显示隐藏。

## 复杂条件显示
```typescript
{
  name: "complexConditional",
  label: "复杂条件",
  type: "text",
  showWhen: {
    field: "status",
    value: "active",
    operator: "eq" // eq, neq, gt, lt, contains
  }
}
```
支持多种条件判断。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "条件显示示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "conditionalGroup",
          title: "条件显示示例",
          fields: [
            {
              name: "userType",
              label: "用户类型",
              type: "select",
              required: true,
              options: [
                { label: "个人", value: "personal" },
                { label: "企业", value: "business" }
              ]
            },
            {
              name: "companyName",
              label: "公司名称",
              type: "text",
              required: true,
              showWhen: {
                field: "userType",
                value: "business"
              }
            },
            {
              name: "businessLicense",
              label: "营业执照",
              type: "upload",
              showWhen: {
                field: "userType",
                value: "business"
              },
              uploadConfig: {
                uploadType: "file",
                accept: ".pdf,.jpg,.png"
              }
            },
            {
              name: "hasSpecialNeeds",
              label: "是否有特殊需求",
              type: "switch"
            },
            {
              name: "specialNeeds",
              label: "特殊需求说明",
              type: "textarea",
              showWhen: {
                field: "hasSpecialNeeds",
                value: true
              }
            },
            {
              name: "status",
              label: "状态",
              type: "select",
              options: [
                { label: "活跃", value: "active" },
                { label: "待审核", value: "pending" },
                { label: "已禁用", value: "disabled" }
              ]
            },
            {
              name: "activeTime",
              label: "活跃时间",
              type: "datetime",
              showWhen: {
                field: "status",
                value: "active",
                operator: "eq"
              }
            },
            {
              name: "disableReason",
              label: "禁用原因",
              type: "textarea",
              showWhen: {
                field: "status",
                value: "disabled",
                operator: "eq"
              }
            }
          ]
        }
      ]
    }
  }
}
```