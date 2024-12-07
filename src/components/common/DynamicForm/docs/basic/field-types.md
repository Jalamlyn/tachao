# DynamicForm 字段类型

## 支持的字段类型

### 1. 基础输入类型

```typescript
type BasicInputType = 
  | "text"      // 文本输入
  | "password"  // 密码输入
  | "number"    // 数字输入
  | "email"     // 邮箱输入
  | "tel"       // 电话输入
  | "url"       // URL输入
  | "textarea"  // 多行文本
```

### 2. 选择类型

```typescript
type SelectionType =
  | "select"    // 下拉选择
  | "radio"     // 单选框
  | "checkbox"  // 复选框
  | "switch"    // 开关
  | "slider"    // 滑块
```

### 3. 日期时间类型

```typescript
type DateTimeType =
  | "date"      // 日期选择
  | "datetime"  // 日期时间选择
```

### 4. 文件类型

```typescript
type FileType =
  | "file"      // 文件上传
  | "image"     // 图片上传
```

### 5. 特殊类型

```typescript
type SpecialType =
  | "resource"   // 资源选择
  | "signature"  // 签名
  | "custom"     // 自定义组件
```

## 字段配置详解

### 1. 基础字段配置

```typescript
interface BaseField {
  name: string           // 字段名称
  label: string         // 显示标签
  type: FormFieldType   // 字段类型
  required?: boolean    // 是否必填
  disabled?: boolean   // 是否禁用
  hidden?: boolean    // 是否隐藏
  placeholder?: string // 占位文本
  tooltip?: TooltipConfig // 提示信息
}
```

### 2. 选择字段配置

```typescript
interface SelectionField extends BaseField {
  type: "select" | "radio" | "checkbox"
  options: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>
  layout?: "horizontal" | "vertical" // 布局方向
}
```

### 3. 资源字段配置

```typescript
interface ResourceField extends BaseField {
  type: "resource"
  resourceConfig: {
    resourceTitle: string
    allowManualInput?: boolean
    manualInputFields?: Array<{
      key: string
      label: string
      type?: "text" | "number" | "email" | "tel"
      required?: boolean
    }>
  }
}
```

### 4. 文件字段配置

```typescript
interface FileField extends BaseField {
  type: "file" | "image"
  accept?: string
  maxSize?: number
  onUpload?: (file: File) => Promise<void>
}
```

### 5. 签名字段配置

```typescript
interface SignatureField extends BaseField {
  type: "signature"
  width?: number
  height?: number
  lineWidth?: number
  lineColor?: string
}
```

## 使用示例

### 1. 基础输入字段

```typescript
// 文本输入
{
  name: "title",
  label: "标题",
  type: "text",
  required: true,
  placeholder: "请输入标题"
}

// 数字输入
{
  name: "amount",
  label: "金额",
  type: "number",
  required: true,
  tooltip: {
    content: "请输入不含税金额"
  }
}
```

### 2. 选择字段

```typescript
// 下拉选择
{
  name: "status",
  label: "状态",
  type: "select",
  options: [
    { label: "启用", value: "active" },
    { label: "禁用", value: "inactive" }
  ]
}

// 单选框组
{
  name: "gender",
  label: "性别",
  type: "radio",
  options: [
    { label: "男", value: "male" },
    { label: "女", value: "female" }
  ],
  layout: "horizontal"
}
```

### 3. 资源字段

```typescript
{
  name: "supplier",
  label: "供应商",
  type: "resource",
  required: true,
  resourceConfig: {
    resourceTitle: "供应商主数据",
    allowManualInput: true,
    manualInputFields: [
      {
        key: "name",
        label: "供应商名称",
        type: "text",
        required: true
      },
      {
        key: "code",
        label: "供应商编码",
        type: "text"
      }
    ]
  }
}
```

### 4. 文件上传

```typescript
{
  name: "attachment",
  label: "附件",
  type: "file",
  accept: ".pdf,.doc,.docx",
  maxSize: 5 * 1024 * 1024, // 5MB
  onUpload: async (file) => {
    // 处理文件上传
  }
}
```

### 5. 签名字段

```typescript
{
  name: "signature",
  label: "签名",
  type: "signature",
  width: 300,
  height: 150,
  lineWidth: 2,
  lineColor: "#000000"
}
```

## 字段验证

### 1. 内置验证

```typescript
{
  name: "email",
  label: "邮箱",
  type: "email",
  required: true,
  validators: [
    (value) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "请输入有效的邮箱地址"
      }
    }
  ]
}
```

### 2. 自定义验证

```typescript
{
  name: "custom",
  label: "自定义字段",
  type: "text",
  validators: [
    async (value, allValues) => {
      // 异步验证
      const result = await validateCustom(value)
      if (!result.valid) {
        return result.message
      }
    }
  ]
}
```

## 最佳实践

1. 字段命名
- 使用有意义的名称
- 遵循驼峰命名规则
- 避免特殊字符

2. 验证规则
- 合理使用必填验证
- 添加适当的自定义验证
- 提供清晰的错误提示

3. 用户体验
- 添加合适的占位文本
- 使用tooltip提供帮助信息
- 保持表单布局的一致性

4. 资源字段使用建议
- 优先使用资源选择模式
- 在无可选数据时启用手动输入
- 合理配置必填字段

## 相关文档

- [表单配置](./configuration.md)
- [表单联动](../advanced/form-linkage.md)
- [基础示例](../examples/basic-forms.md)