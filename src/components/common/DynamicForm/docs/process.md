## 流程步骤配置

流程步骤用于创建多步骤表单。

```typescript
interface ProcessStep {
  key: string;
  title: string;
  description?: string;
  icon?: string;
  fields?: FormField[];
}
```

示例：
```javascript
const processSteps = [
  {
    key: "apply",
    title: "申请信息",
    icon: "mdi:form-select",
    fields: [
      { name: "reason", label: "请假原因", type: "textarea", required: true }
    ]
  },
  {
    key: "approve",
    title: "审批信息",
    icon: "mdi:check-circle",
    fields: [
      { name: "approver", label: "审批人", type: "text", required: true }
    ]
  }
];
```