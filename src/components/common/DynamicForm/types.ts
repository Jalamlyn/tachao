// 基础字段类型
export interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
  validators?: ((value: any) => string | undefined)[]
  options?: { label: string; value: any }[]
}

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  type: string
  width?: string | number
  editable?: boolean
  required?: boolean
  options?: { label: string; value: any }[]
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

// 元数据配置
export interface FormMetadata {
  title: string
  description?: string
  permissions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
  status?: "draft" | "submitted" | "approved" | "rejected"
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  type?: string
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

// 校验结果类型
export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[] // 添加警告信息，不阻止提交但需要提示用户
  fields?: { [key: string]: string } // 字段级别的错误信息
}

// 校验上下文类型
export interface ValidationContext {
  mode?: 'submit' | 'save' | 'custom' // 校验模式
  customData?: any // 自定义数据
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