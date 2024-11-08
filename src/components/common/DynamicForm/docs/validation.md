## 验证配置

验证配置允许您定义自定义的表单级验证逻辑。验证分为以下几个层次:

1. 字段级验证
   - required 验证
   - 类型验证
   - 自定义验证器

2. 表单级验证
   - 字段间关联验证
   - 业务规则验证
   - 警告信息处理

### 验证结果格式

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  fields?: { [key: string]: string };
  // 新增: 分类后的错误信息
  categorizedErrors?: {
    required?: string[];
    invalid?: string[];
    other?: string[];
  }
}
```

### 完整示例

```javascript
const validate = async (values) => {
  const errors = [];
  const warnings = [];

  // 1. 字段间验证
  if (values.endDate && values.startDate) {
    if (new Date(values.endDate) < new Date(values.startDate)) {
      errors.push("结束日期不能早于开始日期");
    }
  }

  // 2. 业务规则验证
  if (values.leaveType === 'sick' && !values.attachment) {
    warnings.push("病假建议上传证明文件");
  }

  // 3. 特殊字段验证
  if (values.amount && values.amount < 0) {
    errors.push("金额不能为负数");
  }

  // 4. 返回验证结果
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fields: {
      endDate: new Date(values.endDate) < new Date(values.startDate) 
        ? "结束日期不能早于开始日期" 
        : undefined,
      amount: values.amount < 0 
        ? "金额不能为负数" 
        : undefined
    }
  };
};
```

### 验证错误展示

DynamicForm 组件会自动处理验证结果:

1. 错误信息分类
```typescript
const categorizedErrors = {
  required: errors.filter(err => err.includes('不能为空')),
  invalid: errors.filter(err => 
    err.includes('格式错误') || err.includes('不能早于')),
  other: errors.filter(err => 
    !err.includes('不能为空') && !err.includes('格式错误'))
};
```

2. 错误展示方式
- 必填错误: 显示在字段下方
- 格式错误: 显示在表单顶部的警告框中
- 其他错误: 显示在表单顶部的错误框中

3. 警告处理
- 显示确认对话框
- 允许用户选择继续或取消
- 记录警告信息

### 最佳实践

1. 错误分类
- 将错误明确分类
- 使用统一的错误信息格式
- 提供清晰的错误提示

2. 警告处理
- 区分错误和警告
- 提供继续操作的选项
- 保持警告信息友好

3. 验证时机
- 提交时验证
- 字段值变化时验证
- 失去焦点时验证

### 注意事项

1. 错误信息格式
- 使用简洁明了的语言
- 指明具体的错误原因
- 提供修正建议

2. 警告处理
- 警告不应阻止表单提交
- 提供清晰的操作选项
- 记录用户的选择

3. 性能考虑
- 避免过于复杂的验证逻辑
- 合理使用异步验证
- 缓存验证结果