# DynamicForm 字段类型系统文档

本文档采用结构化格式，专门针对AI模型理解和处理DynamicForm的字段类型系统。

## 字段类型分类

### 1. 基础输入类型
```typescript
type BasicInputType = 
  | "text"      // 文本输入
  | "password"  // 密码输入
  | "number"    // 数字输入
  | "email"     // 邮箱输入
  | "tel"       // 电话输入
  | "url"       // URL输入
```

特点：
- 简单直接的数据输入
- 内置基本验证
- 支持placeholder
- 支持禁用状态

### 2. 扩展输入类型
```typescript
type ExtendedInputType =
  | "textarea"  // 多行文本
  | "select"    // 下拉选择
  | "date"      // 日期选择
  | "datetime"  // 日期时间选择
```

特点：
- 复杂数据输入
- 自定义验证规则
- 支持格式化
- 支持自定义渲染

### 3. 特殊输入类型
```typescript
type SpecialInputType =
  | "file"      // 文件上传
  | "image"     // 图片上传
  | "signature" // 签名
  | "custom"    // 自定义组件
```

特点：
- 特定场景使用
- 复杂交互逻辑
- 自定义渲染
- 特殊数据处理

### 4. 选择类型
```typescript
type SelectionType =
  | "radio"     // 单选框
  | "checkbox"  // 复选框
  | "switch"    // 开关
  | "slider"    // 滑块
```

特点：
- 选择性输入
- 支持选项配置
- 支持布局设置
- 支持禁用选项

### 5. 资源类型
```typescript
type ResourceType = "resource"  // 资源选择
```

特点：
- 主数据选择
- 支持手动输入
- 复杂数据结构
- 自定义渲染

## 字段配置详解

### 1. 基础字段配置
```typescript
interface BaseFieldConfig {
  name: string           // 字段名称
  label: string         // 字段标签
  type: FormFieldType   // 字段类型
  required?: boolean    // 是否必填
  disabled?: boolean    // 是否禁用
  hidden?: boolean      // 是否隐藏
  placeholder?: string  // 占位文本
  className?: string    // 样式类名
  style?: React.CSSProperties  // 内联样式
}
```

### 2. 验证配置
```typescript
interface ValidationConfig {
  validators?: Array<(value: any, allValues?: any) => string | undefined>
  required?: boolean
  pattern?: RegExp
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  message?: string
}
```

### 3. 选项配置
```typescript
interface OptionConfig {
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }> | ((form: UseFormReturn<any>) => Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>)
}
```

### 4. 资源字段配置
```typescript
interface ResourceFieldConfig {
  resourceConfig: {
    resourceTitle: string
    allowManualInput?: boolean
    manualInputFields?: Array<{
      key: string
      label: string
      type?: ManualInputFieldType
      required?: boolean
      options?: Array<{
        label: string
        value: string | number
      }>
    }>
  }
}
```

## 字段类型使用示例

### 1. 文本输入
```typescript
{
  name: "username",
  label: "用户名",
  type: "text",
  required: true,
  validators: [
    (value) => value?.length >= 3 ? undefined : "用户名至少3个字符"
  ],
  className: "w-full",
  placeholder: "请输入用户名"
}
```

### 2. 数字输入
```typescript
{
  name: "age",
  label: "年龄",
  type: "number",
  required: true,
  min: 0,
  max: 150,
  className: "w-32 text-right",
  validators: [
    (value) => value >= 18 ? undefined : "年龄必须大于18岁"
  ]
}
```

### 3. 选择框
```typescript
{
  name: "status",
  label: "状态",
  type: "select",
  options: [
    { label: "启用", value: "active" },
    { label: "禁用", value: "inactive" },
    { label: "待审核", value: "pending", disabled: true }
  ],
  className: "w-full",
  required: true
}
```

### 4. 日期选择
```typescript
{
  name: "birthday",
  label: "出生日期",
  type: "date",
  required: true,
  className: "w-full",
  validators: [
    (value) => {
      const date = new Date(value)
      return date <= new Date() ? undefined : "出生日期不能大于今天"
    }
  ]
}
```

### 5. 文件上传
```typescript
{
  name: "avatar",
  label: "头像",
  type: "image",
  accept: "image/*",
  className: "w-full",
  onUpload: async (file) => {
    const url = await uploadFile(file)
    return url
  }
}
```

### 6. 资源选择
```typescript
{
  name: "department",
  label: "部门",
  type: "resource",
  required: true,
  resourceConfig: {
    resourceTitle: "部门主数据",
    allowManualInput: true,
    manualInputFields: [
      {
        key: "name",
        label: "部门名称",
        type: "text",
        required: true
      },
      {
        key: "code",
        label: "部门编码",
        type: "text",
        required: true
      },
      {
        key: "type",
        label: "部门类型",
        type: "select",
        options: [
          { label: "业务部门", value: "business" },
          { label: "职能部门", value: "function" }
        ]
      }
    ]
  }
}
```

### 7. 签名字段
```typescript
{
  name: "signature",
  label: "签名",
  type: "signature",
  required: true,
  width: 300,
  height: 150,
  lineWidth: 2,
  lineColor: "#000000",
  className: "border rounded-lg"
}
```

### 8. 滑块
```typescript
{
  name: "progress",
  label: "进度",
  type: "slider",
  min: 0,
  max: 100,
  step: 1,
  className: "w-full",
  style: {
    padding: "1rem 0"
  }
}
```

## 字段联动配置

### 1. 值联动
```typescript
{
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "type") {
        // 根据类型设置其他字段的值
        form.setValue("subType", "")
      }
    })
    return () => subscription.unsubscribe()
  }
}
```

### 2. 选项联动
```typescript
{
  name: "city",
  label: "城市",
  type: "select",
  options: (form) => {
    const province = form.getValues("province")
    return getCityOptions(province)
  }
}
```

### 3. 显示联动
```typescript
{
  name: "otherReason",
  label: "其他原因",
  type: "textarea",
  hidden: (form) => form.getValues("reason") !== "other"
}
```

## 最佳实践

1. 类型选择
- 根据数据特点选择合适的字段类型
- 考虑用户输入便利性
- 注意移动端兼容性

2. 验证配置
- 合理使用必填验证
- 添加适当的格式验证
- 提供清晰的错误提示

3. 样式配置
- 保持样式一致性
- 注意响应式布局
- 适当使用主题变量

4. 性能优化
- 避免过度验证
- 合理使用缓存
- 优化联动逻辑

本文档针对AI模型优化，提供了结构化的字段类型系统说明和示例。每种字段类型都有完整的配置说明和使用示例，便于AI理解和生成正确的字段配置代码。