import { UseFormReturn } from "react-hook-form"
import { ReactNode } from "react"

export type FormFieldType =
  | "text"
  | "password"
  | "number"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "date"
  | "datetime"
  | "file"
  | "image"
  | "custom"
  | "resource"
  | "signature"

export interface FormField {
  name: string
  label: string
  type: FormFieldType
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
  tooltip?: TooltipConfig
  validators?: Array<(value: any, allValues?: any) => string | undefined>
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }> | ((form: UseFormReturn<any>) => Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>)
  accept?: string
  resourceConfig?: {
    resourceName: string
    appId: string
    selectionMode?: "single" | "multiple"
  }
  onUpload?: (file: File) => Promise<void>
  render?: (props: {
    field: any
    form: UseFormReturn<any>
    isEditable: boolean
  }) => ReactNode
  width?: number | string
  height?: number
  lineWidth?: number
  lineColor?: string
  className?: string
}

// 静态分组配置
export interface StaticFieldGroup {
  type: 'static'
  key: string
  title: string
  fields: FormField[]
  description?: string
  icon?: string
}

// 动态分组配置
export interface DynamicFieldGroup {
  type: 'dynamic'
  key: string
  title: string
  resourceTitle: string
  description?: string
  icon?: string
}

// 分组类型联合
export type FormFieldGroup = StaticFieldGroup | DynamicFieldGroup

export interface TableColumn {
  key: string
  title: string
  type: FormFieldType
  width?: string | number
  editable?: boolean
  required?: boolean
  placeholder?: string
  options?: Array<{
    label: string
    value: string | number
  }>
  resourceConfig?: {
    resourceName: string
    appId: string
    selectionMode?: "single" | "multiple"
  }
  render?: (value: any, record: any, index: number) => ReactNode
  summary?: {
    calculate?: (records: any[]) => any
    render?: (value: any) => ReactNode
  }
  calculate?: {
    formula: string
    dependencies?: string[]
  }
}

export interface TableSummary {
  show?: boolean
  label?: string
  className?: string
  style?: React.CSSProperties
}

export interface TableConfig {
  columns: TableColumn[]
  toolbar?: ReactNode
  summary?: TableSummary
}

export interface ProcessStep {
  key: string
  title: string
  description?: string
  icon?: string
  fields?: FormField[]
}

export interface TooltipConfig {
  content: ReactNode
  placement?: "top" | "bottom" | "left" | "right"
}

export interface FormMetadata {
  title: string
  description?: string
  permissions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
}

export interface FormRenderConfig {
  basicFields: FormField[] | {
    groups: FormFieldGroup[]
    defaultGroup?: string
  }
  table?: TableConfig
  processSteps?: ProcessStep[]
}

export interface ValidationContext {
  mode?: "create" | "edit"
  user?: any
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
  fields?: {
    [key: string]: string
  }
  categorizedErrors?: {
    required?: string[]
    invalid?: string[]
    other?: string[]
  }
}

export interface DynamicFormConfig {
  metadata: FormMetadata
  renderConfig: FormRenderConfig
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
  watch?: (form: UseFormReturn<any>) => (() => void)
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
}

export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  onCancel?: () => void
  templateId?: string
  previewMode?: boolean
}

export interface WatchUtils {
  watchField: (fieldName: string, callback: (value: any) => void) => () => void
  watchFields: (fieldNames: string[], callback: (values: any[]) => void) => () => void
  batchUpdate: (updates: Array<{ field: string; value: any }>) => void
  setFieldVisibility: (fieldName: string, visible: boolean) => void
}

export interface CalculateConfig {
  formula: string
  dependencies?: string[]
}