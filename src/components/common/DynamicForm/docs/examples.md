## 完整配置示例

```javascript
const formConfig = {
  metadata: {
    title: "请假申请表",
    description: "用于员工请假申请和审批",
    permissions: {
      edit: true,
      delete: false,
      print: true
    },
    type: "leave-request"
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true,
        tooltip: {
          content: "请输入真实姓名",
          placement: "right"
        }
      },
      {
        name: "department",
        label: "部门",
        type: "select",
        required: true,
        options: [
          { label: "技术部", value: "tech" },
          { label: "人事部", value: "hr" }
        ]
      }
    ],
    processSteps: [
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
    ]
  },
  orderNumberConfig: {
    prefix: "LEAVE",
    fieldName: "leaveNo",
    label: "请假单号"
  },
  validate: async (values) => {
    const errors = [];
    if (values.endDate && values.startDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        errors.push("结束日期不能早于开始日期");
      }
    }
    return {
      valid: errors.length === 0,
      errors,
      fields: {
        endDate: new Date(values.endDate) < new Date(values.startDate) 
          ? "结束日期不能早于开始日期" 
          : undefined
      }
    };
  },
  dependencies: {
    totalDays: {
      dependsOn: ["startDate", "endDate"],
      calculate: (values) => {
        if (!values.startDate || !values.endDate) return 0;
        const start = new Date(values.startDate);
        const end = new Date(values.endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    }
  }
};
```