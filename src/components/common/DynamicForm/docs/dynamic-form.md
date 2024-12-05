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

```mo
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

```mo
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

### FormFieldGroup

分组配置接口：

```mo
interface FormFieldGroup {
  key: string // 分组唯一标识
  title: string // 分组标题
  description?: string // 分组描述
  icon?: string // 分组图标
  fields: FormField[] // 分组字段列表
}
```

### TooltipConfig

提示配置接口：

```mo
interface TooltipConfig {
  content: ReactNode // 提示内容
  placement?: "top" | "bottom" | "left" | "right" // 提示位置
}
```

## 表单配置

### DynamicFormConfig

表单总体配置接口：

```mo
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

```mo
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

### FormRenderConfig

表单渲染配置接口：

```mo
interface FormRenderConfig {
  basicFields:
    | FormField[]
    | {
        groups: FormFieldGroup[] // 分组配置
        defaultGroup?: string // 默认选中的分组
      }
  table?: TableConfig // 表格配置
  processSteps?: ProcessStep[] // 流程步骤配置
}
```

### 基本信息分组配置

基本信息支持分组展示，可以通过 tabs 切换不同分组的内容。

#### 分组配置示例

```typescript
{
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
          description: "请填写基本资料信息",
          fields: [
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true
            },
            {
              name: "gender",
              label: "性别",
              type: "select",
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" }
              ]
            }
          ]
        },
        {
          key: "contact",
          title: "联系方式",
          icon: "mdi:phone",
          description: "请填写联系方式信息",
          fields: [
            {
              name: "phone",
              label: "手机号",
              type: "tel",
              required: true
            },
            {
              name: "email",
              label: "邮箱",
              type: "email"
            }
          ]
        },
        {
          key: "address",
          title: "地址信息",
          icon: "mdi:map-marker",
          fields: [
            {
              name: "province",
              label: "省份",
              type: "select",
              options: []
            },
            {
              name: "city",
              label: "城市",
              type: "select",
              options: []
            }
          ]
        }
      ],
      defaultGroup: "basic" // 默认显示基本信息分组
    }
  }
}
```

#### 分组配置说明

1. groups 数组
   - 每个分组都需要一个唯一的 key
   - title 为分组标题，显示在 tab 上
   - icon 为可选的分组图标，使用 iconify 图标
   - description 为可选的分组描述，显示在分组内容上方
   - fields 数组包含该分组下的所有字段配置

2. defaultGroup
   - 可选配置，指定默认显示哪个分组
   - 值为分组的 key
   - 如果不指定，默认显示第一个分组

3. 分组特性
   - 支持动态切换分组
   - 每个分组可以有独立的字段验证
   - 分组之间的数据是独立的
   - 支持响应式布局

4. 使用建议
   - 根据业务逻辑合理划分字段组
   - 相关的字段放在同一组中
   - 每组字段数量建议不要太多
   - 分组描述要简洁明了

### ValidationContext

验证上下文接口：

```mo
interface ValidationContext {
  mode?: "create" | "edit" // 验证模式
  user?: any // 用户信息
}
```

### ValidationResult

验证结果接口：

```mo
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

```mo
interface TableConfig {
  columns: TableColumn[] // 列配置
  toolbar?: ReactNode // 工具栏
  summary?: TableSummary // 汇总配置
}
```

### TableColumn

表格列配置：

```mo
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
    // 计算字段配置
    formula: string
    dependencies?: string[]
  }
}
```

### TableSummary

表格汇总配置接口：

```mo
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

```mo
interface ProcessStep {
  key: string // 步骤键名
  title: string // 步骤标题
  description?: string // 步骤描述
  icon?: string // 步骤图标
  fields?: FormField[] // 步骤表单字段
}
```

## 资源选择字段

资源选择字段用于从已有的资源数据中选择记录。

### 基本配置

```mo
{
  name: "supplier",
  label: "供应商",
  type: "resource",
  resourceConfig: {
    resourceTitle: "供应商主数据"  // 必须与资源管理中的标题完全匹配
  }
}
```

### 字段特性

- 自动加载资源数据
- 显示已选记录的详细信息
- 支持表单联动
- 支持字段验证
- 响应式布局

### 注意事项

1. resourceTitle 必须与资源管理中的标题完全匹配
2. 资源字段会占用较大空间，建议单独占据一行
3. 确保资源数据已在资源管理中创建