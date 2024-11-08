## 类型定义说明

本文档详细说明了动态表单组件中使用的所有类型定义。

### FormFieldType

表单字段类型枚举。

```typescript
type FormFieldType =
  | "text"      // 文本输入
  | "password"  // 密码输入
  | "number"    // 数字输入
  | "email"     // 邮箱输入
  | "tel"       // 电话输入
  | "url"       // URL输入
  | "textarea"  // 多行文本
  | "select"    // 下拉选择
  | "date"      // 日期选择
  | "datetime"  // 日期时间选择
  | "file"      // 文件上传
  | "image"     // 图片上传
  | "custom"    // 自定义组件
  | "resource"  // 资源选择
```

### FormField

表单字段配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| name | string | 是 | - | 字段名称 |
| label | string | 是 | - | 字段标签 |
| type | FormFieldType | 是 | - | 字段类型 |
| placeholder | string | 否 | undefined | 占位文本 |
| disabled | boolean | 否 | false | 是否禁用 |
| hidden | boolean | 否 | false | 是否隐藏 |
| required | boolean | 否 | false | 是否必填 |
| tooltip | TooltipConfig | 否 | undefined | 提示信息配置 |
| validators | Array<(value: any, allValues?: any) => string \| undefined> | 否 | undefined | 自定义验证器 |
| options | Array<{ label: string; value: string \| number; disabled?: boolean }> | 否 | undefined | 选项列表(用于select类型) |
| accept | string | 否 | undefined | 文件上传接受的类型 |
| resourceConfig | { resourceName: string; appId: string; selectionMode?: "single" \| "multiple" } | 否 | undefined | 资源选择配置 |
| onUpload | (file: File) => Promise<void> | 否 | undefined | 文件上传处理函数 |
| render | (props: { field: any; form: UseFormReturn<any>; isEditable: boolean }) => ReactNode | 否 | undefined | 自定义渲染函数 |

### TableColumn

表格列配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| key | string | 是 | - | 列标识 |
| title | string | 是 | - | 列标题 |
| type | FormFieldType | 是 | - | 列数据类型 |
| width | string \| number | 否 | undefined | 列宽度 |
| editable | boolean | 否 | true | 是否可编辑 |
| required | boolean | 否 | false | 是否必填 |
| placeholder | string | 否 | undefined | 占位文本 |
| options | Array<{ label: string; value: string \| number }> | 否 | undefined | 选项列表 |
| resourceConfig | { resourceName: string; appId: string; selectionMode?: "single" \| "multiple" } | 否 | undefined | 资源选择配置 |
| render | (value: any, record: any, index: number) => ReactNode | 否 | undefined | 自定义渲染函数 |

### TableConfig

表格配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| columns | TableColumn[] | 是 | - | 列配置数组 |
| toolbar | ReactNode | 否 | undefined | 表格工具栏 |

### ProcessStep

流程步骤配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| key | string | 是 | - | 步骤标识 |
| title | string | 是 | - | 步骤标题 |
| description | string | 否 | undefined | 步骤描述 |
| icon | string | 否 | undefined | 步骤图标 |
| fields | FormField[] | 否 | undefined | 步骤表单字段 |

### TooltipConfig

提示信息配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| content | ReactNode | 是 | - | 提示内容 |
| placement | "top" \| "bottom" \| "left" \| "right" | 否 | "top" | 提示位置 |

### FormMetadata

表单元数据配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | 是 | - | 表单标题 |
| description | string | 否 | undefined | 表单描述 |
| permissions | { edit?: boolean; delete?: boolean; print?: boolean } | 否 | undefined | 权限配置 |

### FormRenderConfig

表单渲染配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| basicFields | FormField[] | 是 | - | 基本字段配置 |
| table | TableConfig | 否 | undefined | 表格配置 |
| processSteps | ProcessStep[] | 否 | undefined | 流程步骤配置 |

### ValidationContext

验证上下文。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| mode | "create" \| "edit" | 否 | undefined | 验证模式 |
| user | any | 否 | undefined | 用户信息 |

### ValidationResult

验证结果。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| valid | boolean | 是 | - | 是否验证通过 |
| errors | string[] | 否 | undefined | 错误信息 |
| warnings | string[] | 否 | undefined | 警告信息 |
| fields | { [key: string]: string } | 否 | undefined | 字段错误信息 |
| categorizedErrors | { required?: string[]; invalid?: string[]; other?: string[] } | 否 | undefined | 分类错误信息 |

### DynamicFormConfig

动态表单配置。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| metadata | FormMetadata | 是 | - | 表单元数据 |
| renderConfig | FormRenderConfig | 是 | - | 渲染配置 |
| orderNumberConfig | { prefix?: string; fieldName?: string; label?: string } | 否 | undefined | 单号配置 |
| watch | (form: UseFormReturn<any>) => (() => void) | 否 | undefined | 表单监听函数 |
| validate | (values: any, context?: ValidationContext) => Promise<ValidationResult> \| ValidationResult | 否 | undefined | 表单验证函数 |

### DynamicFormProps

动态表单组件属性。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| config | DynamicFormConfig | 是 | - | 表单配置 |
| id | string | 否 | undefined | 表单ID |
| onSubmit | (values: any) => Promise<void> | 否 | undefined | 提交回调 |
| onCancel | () => void | 否 | undefined | 取消回调 |
| templateId | string | 否 | undefined | 模板ID |

### WatchUtils

监听工具函数。

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| watchField | (fieldName: string, callback: (value: any) => void) => () => void | 是 | - | 监听单个字段 |
| watchFields | (fieldNames: string[], callback: (values: any[]) => void) => () => void | 是 | - | 监听多个字段 |
| batchUpdate | (updates: Array<{ field: string; value: any }>) => void | 是 | - | 批量更新字段 |
| setFieldVisibility | (fieldName: string, visible: boolean) => void | 是 | - | 设置字段可见性 |