# DynamicForm 动态表单组件文档

## 简介

DynamicForm 是一个灵活的动态表单组件，支持以下功能：

- 基础表单字段渲染
- 动态表格（支持多表格）
- 流程确认步骤
- 打印预览
- 自定义验证
- 动态联动

## 配置生成指南

### 1. 字段路径配置

为了简化表单校验，我们使用扁平的字段路径配置：

```typescript
{
  fields: [
    {
      path: "basicInfo.name",  // 使用点号分隔的路径
      label: "姓名",
      type: "text",
      required: true
    }
  ]
}
```

### 2. 流程确认字段配置

对于流程确认步骤中的字段，路径格式为：

```typescript
{
  path: "processConfirmations.{stepKey}.formData.{fieldName}",
  label: "处置原因",
  type: "text",
  required: true
}
```

### 3. 表格字段配置

表格字段的路径格式为：

```typescript
{
  path: "tableData.{columnKey}",
  label: "数量",
  type: "number",
  required: true
}
```

## 基础类型

### FormFieldType

表单字段类型枚举：

```typescript
type FormFieldType =
  | "text" // 文本输入
  | "password" // 密码输入
  | "number" // 数字输入
  | "email" // 邮箱输入
  | "tel" // 电话输入
  | "url" // URL输入
  | "textarea" // 多行文本
  | "select" // 下拉选择
  | "date" // 日期选择
  | "datetime" // 日期时间选择
  | "file" // 文件上传
  | "image" // 图片上传
  | "custom" // 自定义组件
  | "resource" // 资源选择
```

### FormField

表单字段配置接口：

```typescript
interface FormField {
  path: string // 字段路径（新增）
  name: string // 字段名称
  label: string // 字段标签
  type: FormFieldType // 字段类型
  placeholder?: string // 占位文本
  disabled?: boolean // 是否禁用
  hidden?: boolean // 是否隐藏
  required?: boolean // 是否必填
  tooltip?: TooltipConfig // 提示配置
  validators?: Array<(value: any, allValues?: any) => string | undefined> // 自定义验证器
}
```

## 最佳实践

1. 字段命名
   - 使用有意义的路径名称
   - 使用点号分隔路径层级
   - 避免特殊字符

2. 验证规则
   - 合理使用必填验证
   - 添加适当的自定义验证
   - 提供清晰的错误提示

3. 用户体验
   - 添加合适的占位文本
   - 使用 tooltip 提供帮助信息
   - 保持表单布局的一致性

## 注意事项

1. 路径配置
   - 确保路径名称唯一
   - 避免使用特殊字符
   - 保持命名一致性

2. 数据结构
   - 表单配置使用扁平路径
   - 最终数据保持嵌套结构
   - 使用 lodash 的 get/set 处理数据

3. 校验逻辑
   - 使用路径获取值
   - 提供清晰的错误信息
   - 正确处理嵌套数据

## AI 配置生成指南

当使用 AI 生成表单配置时，需要遵循以下规则：

1. 基础字段配置
```typescript
export default {
  renderConfig: {
    basicFields: [
      {
        path: "basicInfo.name",
        name: "name",
        label: "姓名",
        type: "text",
        required: true
      }
    ]
  }
}
```

2. 流程确认配置
```typescript
export default {
  renderConfig: {
    processSteps: [
      {
        key: "approval",
        title: "审批",
        fields: [
          {
            path: "processConfirmations.approval.formData.reason",
            name: "reason",
            label: "审批意见",
            type: "textarea",
            required: true
          }
        ]
      }
    ]
  }
}
```

3. 表格配置
```typescript
export default {
  renderConfig: {
    table: {
      columns: [
        {
          key: "amount",
          title: "数量",
          type: "number",
          required: true,
          path: "tableData.amount"
        }
      ]
    }
  }
}
```

## 错误处理

校验错误会返回以下格式：

```typescript
{
  valid: false,
  errors: ["字段不能为空"],
  fields: {
    "basicInfo.name": "姓名不能为空"
  },
  categorizedErrors: {
    required: [
      { field: "basicInfo.name", message: "姓名不能为空" }
    ]
  }
}
```

## 扩展建议

1. 添加常用验证器
```typescript
const validators = {
  required: (value: any) => !value ? "此字段必填" : undefined,
  email: (value: any) => value && !/^\S+@\S+\.\S+$/.test(value) ? "邮箱格式不正确" : undefined
}
```

2. 使用自定义组件
```typescript
{
  path: "custom.component",
  type: "custom",
  render: ({ field, form, isEditable }) => {
    return <CustomComponent {...field} disabled={!isEditable} />
  }
}
```

## 结论

使用扁平的字段路径配置可以：
1. 简化表单校验逻辑
2. 提高代码可维护性
3. 减少错误处理的复杂度
4. 保持数据结构的语义化

同时要注意：
1. 正确设置字段路径
2. 保持命名规范
3. 提供清晰的错误提示
4. 正确处理数据转换