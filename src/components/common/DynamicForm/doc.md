# DynamicForm 动态表单组件文档

## 简介

DynamicForm 是一个灵活的动态表单组件，支持以下功能：

- 基础表单字段渲染
- 动态表格
- 流程确认步骤
- 打印预览
- 自定义验证
- 动态联动

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

## Watch 指令

Watch 指令用于监听表单字段的变化。以下是一个使用单个 watch 的例子：

```typescript
watch: (form) => {
  const unsubscribe = form.watch((value, { name, type }) => {
    if (name === 'startDate' || name === 'endDate') {
      const start = form.getValues('startDate') ? new Date(form.getValues('startDate')) : null;
      const end = form.getValues('endDate') ? new Date(form.getValues('endDate')) : null;

      if (start && end) {
        const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        form.setValue('leaveDays', days);
        form.trigger('leaveDays'); // 强制触发表单更新
      }
    }
  });

  return () => unsubscribe();
},

```

在这个例子中：

- `watch` 函数接受一个回调函数作为参数
- 回调函数接收三个参数：`value`（字段的新值），`name`（字段名称），和 `type`（变化类型）
- 回调函数中，我们简单地将这些值打印到控制台
- `watch` 函数返回一个订阅对象，我们将其存储在 `subscription` 变量中
- 最后，我们返回一个清理函数，该函数在组件卸载时调用 `subscription.unsubscribe()` 来取消订阅

注意：这种写法是必须的，它确保了在组件卸载时正确地清理了监听器，防止内存泄漏。
