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

### 完整的表格配置示例

1. 基础表格配置：

```mo
{
  renderConfig: {
    table: {
      columns: [
        {
          key: "assetName",
          title: "资产名称",
          type: "text",
          width: "200px",
          required: true,
          editable: true
        },
        {
          key: "specification",
          title: "规格型号",
          type: "text",
          width: "150px"
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          width: "100px",
          editable: true
        },
        {
          key: "status",
          title: "状态",
          type: "select",
          width: "120px",
          options: [
            { label: "在库", value: "in_stock" },
            { label: "在用", value: "in_use" },
            { label: "维修", value: "maintenance" },
            { label: "报废", value: "scrapped" }
          ]
        }
      ],
      summary: {
        show: true,
        label: "合计",
        className: "font-bold",
        style: { backgroundColor: "#f5f5f5" }
      }
    }
  }
}
```

2. 带计算字段的表格配置：

```mo
{
  renderConfig: {
    table: {
      columns: [
        {
          key: "productName",
          title: "产品名称",
          type: "text",
          width: "200px"
        },
        {
          key: "price",
          title: "单价",
          type: "number",
          width: "120px",
          editable: true
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          width: "100px",
          editable: true
        },
        {
          key: "amount",
          title: "金额",
          type: "number",
          width: "150px",
          calculate: {
            formula: "price * quantity",
            dependencies: ["price", "quantity"]
          }
        },
        {
          key: "tax",
          title: "税额",
          type: "number",
          width: "150px",
          calculate: {
            formula: "amount * 0.13",
            dependencies: ["amount"]
          }
        },
        {
          key: "totalAmount",
          title: "价税合计",
          type: "number",
          width: "180px",
          calculate: {
            formula: "amount + tax",
            dependencies: ["amount", "tax"]
          }
        }
      ],
      summary: {
        show: true,
        label: "合计"
      }
    }
  }
}
```

3. 带验证规则的表格配置：

```mo
{
  renderConfig: {
    table: {
      columns: [
        {
          key: "startDate",
          title: "开始日期",
          type: "date",
          width: "150px",
          validators: [
            (value, row) => {
              if (row.endDate && value > row.endDate) {
                return "开始日期不能晚于结束日期"
              }
            }
          ]
        },
        {
          key: "endDate",
          title: "结束日期",
          type: "date",
          width: "150px",
          validators: [
            (value, row) => {
              if (row.startDate && value < row.startDate) {
                return "结束日期不能早于开始日期"
              }
            }
          ]
        },
        {
          key: "budget",
          title: "预算金额",
          type: "number",
          width: "150px",
          validators: [
            (value) => {
              if (value < 0) {
                return "预算金额不能为负数"
              }
              if (value > 1000000) {
                return "预算金额不能超过100万"
              }
            }
          ]
        }
      ]
    }
  }
}
```

4. 带资源选择的表格配置：

```mo
{
  renderConfig: {
    table: {
      columns: [
        {
          key: "supplier",
          title: "供应商",
          type: "resource",
          width: "200px",
          resourceConfig: {
            resourceName: "supplier",
            appId: "your-app-id",
            selectionMode: "single"
          }
        },
        {
          key: "contact",
          title: "联系人",
          type: "text",
          width: "120px"
        },
        {
          key: "phone",
          title: "联系电话",
          type: "tel",
          width: "150px",
          validators: [
            (value) => {
              if (!/^1[3-9]\d{9}$/.test(value)) {
                return "请输入有效的手机号码"
              }
            }
          ]
        }
      ]
    }
  }
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

### FormRenderConfig

表单渲染配置接口：

```mo
interface FormRenderConfig {
  basicFields: FormField[] // 基础字段配置，用于渲染基本表单字段
  table?: TableConfig // 表格配置，用于渲染动态表格
  processSteps?: ProcessStep[] // 流程步骤配置，用于渲染流程确认步骤
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
