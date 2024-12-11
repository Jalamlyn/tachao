# 动态表单使用示例

本文档提供了完整的动态表单配置示例。

## 复杂联动计算示例

以下示例展示了如何实现复杂的表单联动计算：

```typescript
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

const complexCalculationForm: DynamicFormConfig = {
  metadata: {
    title: "复杂联动计算表单",
    description: "展示如何处理复杂的表单计算和联动",
    permissions: {
      edit: true
    }
  },

  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "calculation",
          title: "联动计算示例",
          icon: "mdi:calculator",
          description: "演示复杂的表单字段联动计算",
          fields: [
            {
              name: "quantity",
              label: "产品数量",
              type: "number",
              required: true,
              defaultValue: 0
            },
            {
              name: "unitPrice",
              label: "单价",
              type: "number", 
              required: true,
              defaultValue: 0
            },
            {
              name: "discountRate",
              label: "折扣率 (%)",
              type: "number",
              required: true,
              defaultValue: 0,
              min: 0,
              max: 100
            },
            {
              name: "taxRate", 
              label: "税率 (%)",
              type: "number",
              required: true,
              defaultValue: 0,
              min: 0,
              max: 100
            },
            {
              name: "discountAmount",
              label: "折扣金额",
              type: "number",
              disabled: true,
              defaultValue: 0
            },
            {
              name: "taxAmount",
              label: "税额",
              type: "number", 
              disabled: true,
              defaultValue: 0
            },
            {
              name: "totalAmount",
              label: "总金额",
              type: "number",
              disabled: true,
              defaultValue: 0
            }
          ]
        }
      ]
    }
  },

  watch: (form) => {
    // 添加防递归标记
    let isCalculating = false;

    const subscription = form.watch((value, { name }) => {
      // 防止递归计算
      if (isCalculating) return;
      
      try {
        isCalculating = true;
        
        // 获取所有需要的值
        const quantity = Number(form.getValues("quantity")) || 0;
        const unitPrice = Number(form.getValues("unitPrice")) || 0;
        const discountRate = Number(form.getValues("discountRate")) / 100 || 0;
        const taxRate = Number(form.getValues("taxRate")) / 100 || 0;

        // 按顺序执行计算
        // 1. 计算折扣金额
        const discountAmount = quantity * unitPrice * discountRate;
        form.setValue("discountAmount", discountAmount.toFixed(2));

        // 2. 计算应税金额
        const taxableAmount = quantity * unitPrice - discountAmount;

        // 3. 计算税额
        const taxAmount = taxableAmount * taxRate;
        form.setValue("taxAmount", taxAmount.toFixed(2));

        // 4. 计算总金额
        const totalAmount = taxableAmount + taxAmount;
        form.setValue("totalAmount", totalAmount.toFixed(2));
        
      } finally {
        isCalculating = false;
      }
    });

    return () => subscription.unsubscribe();
  },

  validate: async (values) => {
    const errors = {
      fields: {},
      categorizedErrors: {
        required: [],
        invalid: [],
        other: []
      }
    };

    // 验证数量为正数
    if (values.quantity <= 0) {
      errors.fields.quantity = "数量必须大于0";
      errors.categorizedErrors.invalid.push({
        field: "quantity",
        message: "数量必须大于0"
      });
    }

    // 验证单价为正数
    if (values.unitPrice <= 0) {
      errors.fields.unitPrice = "单价必须大于0";
      errors.categorizedErrors.invalid.push({
        field: "unitPrice",
        message: "单价必须大于0"
      });
    }

    // 验证折扣率范围
    if (values.discountRate < 0 || values.discountRate > 100) {
      errors.fields.discountRate = "折扣率必须在0-100之间";
      errors.categorizedErrors.invalid.push({
        field: "discountRate",
        message: "折扣率必须在0-100之间"
      });
    }

    // 验证税率范围
    if (values.taxRate < 0 || values.taxRate > 100) {
      errors.fields.taxRate = "税率必须在0-100之间";
      errors.categorizedErrors.invalid.push({
        field: "taxRate",
        message: "税率必须在0-100之间"
      });
    }

    return {
      valid: Object.keys(errors.fields).length === 0,
      errors: Object.values(errors.fields),
      fields: errors.fields,
      categorizedErrors: errors.categorizedErrors
    };
  }
};

export default complexCalculationForm;
```

### 复杂联动计算示例说明

这个示例展示了如何实现一个包含复杂计算逻辑的表单：

1. **字段设计**:
   - 基础输入字段：数量、单价、折扣率、税率
   - 计算字段：折扣金额、税额、总金额

2. **计算逻辑**:
   - 折扣金额 = 数量 * 单价 * 折扣率
   - 应税金额 = 数量 * 单价 - 折扣金额
   - 税额 = 应税金额 * 税率
   - 总金额 = 应税金额 + 税额

3. **特点**:
   - 使用watch函数处理字段联动
   - 防止递归计算
   - 添加了数值验证
   - 支持小数计算
   - 自动格式化金额

4. **最佳实践**:
   - 使用isCalculating标记防止递归
   - 统一的数值格式化
   - 完善的错误处理
   - 清晰的计算步骤

### 使用示例

```tsx
import { DynamicForm } from "@/components/common/DynamicForm"
import complexCalculationForm from "./complexCalculationForm"

const ComplexCalculationForm = () => {
  const handleSubmit = async (validationResult, values) => {
    if (validationResult.valid) {
      console.log("Form values:", values)
    }
  }

  return (
    <DynamicForm 
      config={complexCalculationForm} 
      onSubmit={handleSubmit}
      isCreateMode={true}
    />
  )
}

export default ComplexCalculationForm
```

## 采购申请单示例

[原有的采购申请单示例保持不变，从这里开始]

const formConfig: DynamicFormConfig = {
  metadata: {
    title: "采购申请单",
    description: "用于提交采购申请的电子表单",
    permissions: {
      edit: true,
      delete: true,
      print: true
    }
  },

[保持原有示例的所有内容不变...]