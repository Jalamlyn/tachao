# DynamicForm 动态表单组件文档

## 简介

DynamicForm 是一个灵活的动态表单组件，支持以下功能：

- 基础表单字段渲染
- 动态表格
- 流程确认步骤
- 打印预览
- 自定义验证
- 动态联动
- AI 生成的公式计算（新功能）

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
  name: string // 字段名称
  label: string // 字段标签
  type: FormFieldType // 字段类型
  placeholder?: string // 占位文本
  disabled?: boolean // 是否禁用
  hidden?: boolean // 是否隐藏
  required?: boolean // 是否必填
  tooltip?: TooltipConfig // 提示配置
  validators?: Array<(value: any, allValues?: any) => string | undefined> // 自定义验证器
  options?: Array<{
    // 选项配置（用于select类型）
    label: string
    value: string | number
    disabled?: boolean
  }>
  accept?: string // 文件接受类型
  resourceConfig?: {
    // 资源选择配置
    resourceName: string
    appId: string
    selectionMode?: "single" | "multiple"
  }
  onUpload?: (file: File) => Promise<void> // 上传处理函数
  render?: (props: {
    // 自定义渲染函数
    field: any
    form: UseFormReturn<any>
    isEditable: boolean
  }) => ReactNode
}
```

### TooltipConfig

提示配置接口：

```typescript
interface TooltipConfig {
  content: ReactNode // 提示内容
  placement?: "top" | "bottom" | "left" | "right" // 提示位置
}
```

## 表单配置

### DynamicFormConfig

表单总体配置接口：

```typescript
interface DynamicFormConfig {
  metadata: FormMetadata // 元数据配置
  renderConfig: FormRenderConfig // 渲染配置
  orderNumberConfig?: {
    // 单号配置
    prefix?: string
    fieldName?: string
    label?: string
  }
  watch?: (form: UseFormReturn<any>) => () => void // 表单监听函数
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult // 表单验证函数
}
```

watch 函数示例：只使用单个 watch 来监听所有字段的变化

```typescript
watch: (form) => {
  const subscription = form.watch((value, { name, type }) => {
    console.log("[useDynamicForm] Form value changed:", { field: name, type, value })
    console.log("[useDynamicForm] Current form values:", form.getValues())

    // 触发表单重新渲染
    form.trigger(name)
  })

  return () => subscription.unsubscribe()
}
```

### FormMetadata

表单元数据配置：

```typescript
interface FormMetadata {
  title: string // 表单标题
  description?: string // 表单描述
  permissions?: {
    // 权限配置
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
}
```

### ValidationContext

验证上下文接口：

```typescript
interface ValidationContext {
  mode?: "create" | "edit" // 验证模式
  user?: any // 用户信息
}
```

### ValidationResult

验证结果接口：

```typescript
interface ValidationResult {
  valid: boolean // 是否验证通过
  errors?: string[] // 错误信息
  warnings?: string[] // 警告信息
  fields?: {
    // 字段错误信息
    [key: string]: string
  }
  categorizedErrors?: {
    // 分类错误信息
    required?: string[] // 必填错误
    invalid?: string[] // 格式错误
    other?: string[] // 其他错误
  }
}
```

## 表格配置

### TableConfig

表格配置接口：

```typescript
interface TableConfig {
  columns: TableColumn[] // 列配置
  toolbar?: ReactNode // 工具栏
  summary?: TableSummary // 汇总配置
}
```

### TableColumn

表格列配置：

```typescript
interface TableColumn {
  key: string // 列键名
  title: string // 列标题
  type: FormFieldType // 列类型
  width?: string | number // 列宽度
  editable?: boolean // 是否可编辑
  required?: boolean // 是否必填
  placeholder?: string // 占位文本
  options?: Array<{
    // 选项配置
    label: string
    value: string | number
  }>
  resourceConfig?: {
    // 资源配置
    resourceName: string
    appId: string
    selectionMode?: "single" | "multiple"
  }
  render?: (value: any, record: any, index: number) => ReactNode // 自定义渲染
  summary?: {
    // 汇总配置
    calculate?: (records: any[]) => any
    render?: (value: any) => ReactNode
  }
  calculate?: {
    // 计算配置（新增）
    formula: string // 计算公式
    dependencies?: string[] // 依赖字段
  }
}
```

### TableSummary

表格汇总配置接口：

```typescript
interface TableSummary {
  show?: boolean // 是否显示汇总行
  label?: string // 汇总行标签
  className?: string // 自定义类名
  style?: React.CSSProperties // 自定义样式
}
```

## 流程确认配置

### ProcessStep

流程步骤配置：

```typescript
interface ProcessStep {
  key: string // 步骤键名
  title: string // 步骤标题
  description?: string // 步骤描述
  icon?: string // 步骤图标
  fields?: FormField[] // 步骤表单字段
}
```

### FormRenderConfig

表单渲染配置接口：

```typescript
interface FormRenderConfig {
  basicFields: FormField[] // 基础字段配置，用于渲染基本表单字段
  table?: TableConfig // 表格配置，用于渲染动态表格
  processSteps?: ProcessStep[] // 流程步骤配置，用于渲染流程确认步骤
}
```

## 新增：AI 生成的公式计算

DynamicForm 现在支持 AI 生成的公式计算功能。这个功能允许表格中的所有字段都支持计算。

### 使用方法

在 TableColumn 配置中，你可以添加 `calculate` 属性来定义计算逻辑：

```typescript
{
  key: "totalPrice",
  title: "总价",
  type: "number",
  editable: false,
  calculate: {
    formula: "row.quantity * row.unitPrice * (1 - (row.discount || 0))",
    dependencies: ["quantity", "unitPrice", "discount"]
  }
}
```

### 注意事项

1. 公式中可以使用 `row` 对象访问当前行的所有字段值。
2. 公式支持基本的数学运算和 Formula.js 提供的函数。
3. 出于安全考虑，某些 JavaScript 函数（如 `eval`）在公式中是被禁止的。
4. 计算是通过 FormulaService 进行的，它提供了安全的公式评估机制。
