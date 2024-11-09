## 完整配置示例

```typescript
const formConfig: DynamicFormConfig = {
  metadata: {
    title: "订单表单",
    description: "用于创建和编辑订单"
  },
  renderConfig: {
    basicFields: [
      {
        name: "type",
        label: "订单类型",
        type: "select",
        options: [
          { label: "普通订单", value: "normal" },
          { label: "特殊订单", value: "special" }
        ]
      },
      {
        name: "extraInfo",
        label: "额外信息",
        type: "textarea",
        hidden: true
      }
    ],
    table: {
      columns: [
        { key: "product", title: "产品", type: "text" },
        { key: "quantity", title: "数量", type: "number" },
        { key: "price", title: "单价", type: "number" },
        { key: "amount", title: "金额", type: "number" }
      ]
    }
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      try {
        // 处理订单类型变化
        if (name === 'type') {
          form.setValue("extraInfo.hidden", value !== "special");
        }

        // 处理表格数据变化
        if (name.startsWith('tableData')) {
          const tableData = form.getValues('tableData') || [];
          
          // 计算每行金额
          tableData.forEach((row, index) => {
            const quantity = Number(row.quantity) || 0;
            const price = Number(row.price) || 0;
            form.setValue(`tableData.${index}.amount`, quantity * price);
          });

          // 计算总金额
          const total = tableData.reduce((sum, row) => 
            sum + (Number(row.amount) || 0), 0
          );
          form.setValue("totalAmount", total);
        }

      } catch (error) {
        console.error(`Watch error for field ${name}:`, error);
      }
    });

    return () => subscription.unsubscribe();
  },
  validate: async (values) => {
    const errors = [];
    const warnings = [];

    // 1. 字段间验证
    if (values.endDate && values.startDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        errors.push("结束日期不能早于开始日期");
      }
    }

    // 2. 业务规则验证
    if (values.leaveType === 'sick') {
      if (!values.reason) {
        errors.push("病假必须填写请假原因");
      }
      if (!values.attachment) {
        warnings.push("建议上传病假证明");
      }
    }

    // 3. 表格数据验证
    if (values.tableData) {
      values.tableData.forEach((row, index) => {
        if (row.quantity <= 0) {
          errors.push(`第 ${index + 1} 行的数量必须大于0`);
        }
        if (row.price <= 0) {
          errors.push(`第 ${index + 1} 行的单价必须大于0`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fields: {
        endDate: new Date(values.endDate) < new Date(values.startDate) 
          ? "结束日期不能早于开始日期" 
          : undefined,
        reason: values.leaveType === 'sick' && !values.reason
          ? "病假必须填写请假原因"
          : undefined
      },
      // 新增: 分类后的错误信息
      categorizedErrors: {
        required: errors.filter(err => err.includes('不能为空')),
        invalid: errors.filter(err => 
          err.includes('格式错误') || err.includes('不能早于')),
        other: errors.filter(err => 
          !err.includes('不能为空') && !err.includes('格式错误'))
      }
    };
  }
};
```

### 请假申请单示例

```javascript
const formConfig = {
  metadata: {
    title: "请假申请单"
  },
  renderConfig: {
    basicFields: [
      {
        name: "startDate",
        label: "开始日期",
        type: "date",
        required: true
      },
      {
        name: "endDate",
        label: "结束日期",
        type: "date",
        required: true
      },
      {
        name: "leaveType",
        label: "请假类型",
        type: "select",
        options: [
          { label: "年假", value: "annual" },
          { label: "病假", value: "sick" }
        ],
        required: true
      }
    ]
  },
  validate: async (values) => {
    const errors = [];
    const warnings = [];

    // 日期验证
    if (values.startDate && values.endDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        errors.push("结束日期不能早于开始日期");
      }
    }

    // 业务规则验证
    if (values.leaveType === 'sick') {
      if (!values.reason) {
        errors.push("病假必须填写请假原因");
      }
      if (!values.attachment) {
        warnings.push("建议上传病假证明");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fields: {
        endDate: new Date(values.endDate) < new Date(values.startDate) 
          ? "结束日期不能早于开始日期" 
          : undefined,
        reason: values.leaveType === 'sick' && !values.reason
          ? "病假必须填写请假原因"
          : undefined
      }
    };
  }
};
```