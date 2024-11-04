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
/**
 * @deprecated 使用 TableNumericCalculator 替代，确保计算结果为数字类型
 */
export type TableSummaryCalculator = (records: any[]) => number | string

/**
 * 数值计算函数 - 用于表格汇总等需要进行数值计算的场景
 */
export type TableNumericCalculator = (records: any[]) => number

// 表格汇总字段配置
/**
 * @deprecated 使用 TableNumericSummaryField 替代，提供更好的类型安全性
 */
export interface TableSummaryField {
  label: string
  calculate: TableSummaryCalculator
}

/**
 * 改进的表格汇总字段配置 - 分离计算和格式化逻辑
 */
export interface TableNumericSummaryField {
  label: string
  calculate: TableNumericCalculator
  format?: (value: number) => string // 可选的格式化函数
}

// 表格汇总配置
/**
 * @deprecated 使用 TableNumericSummary 替代
 */
export interface TableSummary {
  fields: {
    [key: string]: TableSummaryField
  }
}

/**
 * 改进的表格汇总配置 - 使用更严格的数值类型
 */
export interface TableNumericSummary {
  fields: {
    [key: string]: TableNumericSummaryField
  }
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
  validations?: {
    rules: ((values: any) => string | undefined)[]
  }
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
}

// 渲染配置
export interface FormRenderConfig {
  // 基本信息字段
  basicFields: FormField[]

  // 表格配置
  table?: {
    columns: TableColumn[]
    summary?: TableNumericSummary | TableSummary // 支持新旧两种类型，保持向后兼容
    rowCalculations?: {
      [key: string]: (row: any) => any
    }
  }

  // 流程步骤
  processSteps?: ProcessStep[]
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
}

// 动态表单组件Props
export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
  onSubmit?: (values: any) => Promise<void>
  onCancel?: () => void
}