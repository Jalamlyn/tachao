## 验证配置

验证配置允许您定义自定义的表单级验证逻辑。

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  fields?: { [key: string]: string };
}
```

示例：
```javascript
const validate = async (values) => {
  const errors = [];
  const warnings = [];

  if (values.endDate && values.startDate) {
    if (new Date(values.endDate) < new Date(values.startDate)) {
      errors.push("结束日期不能早于开始日期");
    }
  }

  if (values.leaveType === 'sick' && !values.attachment) {
    warnings.push("建议上传病假证明");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fields: {
      endDate: new Date(values.endDate) < new Date(values.startDate) 
        ? "结束日期不能早于开始日期" 
        : undefined
    }
  };
};
```