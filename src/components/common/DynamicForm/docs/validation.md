## 验证配置

验证配置提供了强大的表单验证功能，支持字段级和表单级的验证。

### 验证类型

1. 字段验证
```typescript
interface FieldValidation {
  required?: boolean;           // 必填验证
  pattern?: RegExp;            // 正则验证
  min?: number;                // 最小值
  max?: number;                // 最大值
  minLength?: number;          // 最小长度
  maxLength?: number;          // 最大长度
  validate?: (value: any, formValues: any) => string | undefined;  // 自定义验证
}
```

2. 表单验证
```typescript
interface FormValidation {
  valid: boolean;              // 验证结果
  errors?: string[];          // 错误信息
  warnings?: string[];        // 警告信息
  fields?: {                  // 字段错误
    [key: string]: string;
  };
  categorizedErrors?: {       // 分类错误
    required?: string[];     // 必填错误
    invalid?: string[];      // 格式错误
    other?: string[];       // 其他错误
  };
}
```

### 完整示例

```typescript
const config = {
  validate: async (values, context) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fields: Record<string, string> = {};

    // 1. 字段间验证
    if (values.endDate && values.startDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        errors.push("结束日期不能早于开始日期");
        fields.endDate = "结束日期不能早于开始日期";
      }
    }

    // 2. 业务规则验证
    if (values.leaveType === 'sick' && !values.attachment) {
      warnings.push("建议上传病假证明");
    }

    // 3. 金额验证
    if (values.amount && values.amount < 0) {
      errors.push("金额不能为负数");
      fields.amount = "金额不能为负数";
    }

    // 4. 表格数据验证
    if (values.tableData) {
      values.tableData.forEach((row, index) => {
        if (row.quantity <= 0) {
          errors.push(`第 ${index + 1} 行的数量必须大于0`);
          fields[`tableData.${index}.quantity`] = "数量必须大于0";
        }
      });
    }

    // 5. 流程验证
    if (values.processConfirmations) {
      const steps = Object.values(values.processConfirmations);
      const hasRejection = steps.some(step => step.status === 'rejected');
      if (hasRejection) {
        errors.push("存在被拒绝的审批步骤");
      }
    }

    // 分类错误信息
    const categorizedErrors = {
      required: errors.filter(err => err.includes('不能为空')),
      invalid: errors.filter(err => 
        err.includes('格式错误') || 
        err.includes('不能早于') ||
        err.includes('必须大于')),
      other: errors.filter(err => 
        !err.includes('不能为空') && 
        !err.includes('格式错误') &&
        !err.includes('不能早于') &&
        !err.includes('必须大于'))
    };

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fields,
      categorizedErrors
    };
  }
};
```

### 验证规则

1. 必填验证
```typescript
{
  name: "title",
  label: "标题",
  required: true,
  validate: (value) => {
    if (!value?.trim()) {
      return "标题不能为空";
    }
  }
}
```

2. 格式验证
```typescript
{
  name: "email",
  label: "邮箱",
  validate: (value) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "请输入有效的邮箱地址";
    }
  }
}
```

3. 范围验证
```typescript
{
  name: "age",
  label: "年龄",
  validate: (value) => {
    if (value < 18 || value > 60) {
      return "年龄必须在18-60岁之间";
    }
  }
}
```

4. 自定义验证
```typescript
{
  name: "custom",
  label: "自定义",
  validate: async (value, formValues) => {
    // 异步验证
    const result = await validateCustomField(value);
    if (!result.valid) {
      return result.message;
    }
  }
}
```

### 验证时机

1. 提交时验证
```typescript
const handleSubmit = async (values) => {
  const validationResult = await validateForm();
  if (!validationResult.valid) {
    // 显示错误信息
    return;
  }
  // 提交表单
};
```

2. 字段变化时验证
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'email') {
      form.trigger('email');
    }
  });
  return () => subscription.unsubscribe();
}
```

3. 失去焦点时验证
```typescript
{
  name: "field",
  onBlur: () => {
    form.trigger('field');
  }
}
```

### 错误展示

1. 字段错误
```tsx
<FormField
  name="field"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>{field.label}</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      {fieldState.error && (
        <FormMessage>{fieldState.error.message}</FormMessage>
      )}
    </FormItem>
  )}
/>
```

2. 表单错误
```tsx
{validationErrors.required && (
  <Alert variant="destructive">
    <AlertTitle>必填项未填写</AlertTitle>
    <AlertDescription>
      <ul>
        {validationErrors.required.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </AlertDescription>
  </Alert>
)}
```

### 最佳实践

1. 验证规则
- 保持验证规则简单明确
- 提供清晰的错误提示
- 处理边界情况

2. 性能优化
- 避免过于复杂的验证逻辑
- 合理使用异步验证
- 缓存验证结果

3. 用户体验
- 即时反馈
- 清晰的错误提示
- 友好的警告信息

4. 错误处理
- 分类显示错误
- 突出显示必填错误
- 提供修正建议