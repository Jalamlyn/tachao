// 字段类型枚举
export type FormFieldType = 
  | 'text'          // 文本输入
  | 'password'      // 密码输入
  | 'number'        // 数字输入
  | 'email'         // 邮箱输入
  | 'tel'           // 电话输入
  | 'url'           // URL输入
  | 'textarea'      // 多行文本
  | 'select'        // 下拉选择
  | 'date'          // 日期选择
  | 'datetime'      // 日期时间选择
  | 'file'          // 文件上传
  | 'image'         // 图片上传
  | 'custom'        // 自定义组件
  | 'resource'      // 资源选择

// 基础字段类型
export interface FormField {
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>
  // 验证规则
  validators?: Array<(value: any, allValues?: any) => string | undefined>
  // 条件显示
  showWhen?: {
    field: string
    value: any
    operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'contains'
  }
  // 资源选择配置
  resourceConfig?: {
    resourceName: string
    appId?: string
    selectionMode?: 'single' | 'multiple'
  }
  // 自定义渲染
  render?: (props: {
    field: any
    form: any
    isEditable: boolean
  }) => React.ReactNode
}

// 表格列类型
export type TableColumnType = 
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'resource'
  | 'custom'

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  type: TableColumnType
  width?: string | number
  editable?: boolean
  required?: boolean
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>
  resourceConfig?: {
    resourceName: string
    appId?: string
    selectionMode?: 'single' | 'multiple'
  }
  render?: (value: any, record: any, index: number) => React.ReactNode
}

// 表格汇总计算函数类型
export type TableSummaryCalculator = (records: any[]) => number

// 表格汇总字段配置
export interface TableSummaryField {
  label: string
  calculate: TableSummaryCalculator
}

// 表格汇总配置
export interface TableSummary {
  fields: {
    [key: string]: TableSummaryField
  }
}

// 行级计算配置
export interface TableRowCalculations {
  [key: string]: (row: any) => any
}

// 流程步骤
export interface ProcessStep {
  key: string
  title: string
  description?: string
  icon?: string
  fields?: FormField[]
  onConfirm?: () => Promise<void>
  onCancel?: () => void
}

// 表单状态
export type FormStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

// 元数据配置
export interface FormMetadata {
  title: string
  description?: string
  permissions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
  status?: FormStatus
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  type?: string
}

// 工具栏按钮类型
export interface ToolbarButton {
  key: string
  label: string
  icon?: string
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  isIconOnly?: boolean
  showWhen?: {
    field: string
    value: any
    operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'contains'
  }
}

// 渲染配置
export interface FormRenderConfig {
  // 基本信息字段
  basicFields: FormField[]

  // 表格配置
  table?: {
    columns: TableColumn[]
    summary?: TableSummary
    // 添加行级计算配置
    rowCalculations?: TableRowCalculations
  }

  // 流程步骤
  processSteps?: ProcessStep[]
}

// 校验模式
export type ValidationMode = 'submit' | 'save' | 'custom'

// 校验上下文类型
export interface ValidationContext {
  mode?: ValidationMode
  customData?: any
}

// 校验错误分类
export interface CategorizedErrors {
  required?: string[]
  invalid?: string[]
  other?: string[]
}

// 校验结果类型
export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
  fields?: { [key: string]: string }
  categorizedErrors?: CategorizedErrors
}

// 动态表单配置
export interface DynamicFormConfig {
  metadata: FormMetadata
  renderConfig: FormRenderConfig
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
  // 添加表单级别的校验函数
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
  // 添加字段依赖关系配置
  dependencies?: {
    [key: string]: {
      dependsOn: string[]
      calculate: (values: any) => any
    }
  }
}

// 动态表单组件Props
export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
  onSubmit?: (values: any) => Promise<void>
  onCancel?: () => void
}