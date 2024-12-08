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
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"

export type ManualInputFieldType = 
  | "text" 
  | "number" 
  | "email" 
  | "tel" 
  | "textarea" 
  | "select" 
  | "date" 
  | "datetime"

export interface ResourceConfig {
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
  options?:
    | Array<{
        label: string
        value: string | number
        disabled?: boolean
      }>
    | ((form: UseFormReturn<any>) => Array<{
        label: string
        value: string | number
        disabled?: boolean
      }>)
  accept?: string
  resourceConfig?: ResourceConfig
  onUpload?: (file: File) => Promise<void>
  render?: (props: { field: any; form: UseFormReturn<any>; isEditable: boolean }) => ReactNode
  width?: number | string
  height?: number
  lineWidth?: number
  lineColor?: string
  className?: string
  checkedLabel?: string
  uncheckedLabel?: string
  min?: number
  max?: number
  step?: number
  layout?: "horizontal" | "vertical"
  path?: string
  style?: React.CSSProperties
}

export interface FormFieldGroup {
  key: string
  title: string
  fields: FormField[]
  description?: string
  icon?: string
  className?: string
  style?: React.CSSProperties
}

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
  resourceConfig?: ResourceConfig
  render?: (value: any, record: any, index: number) => ReactNode
  summary?: {
    render?: (value: any) => ReactNode
  }
  className?: string
  style?: React.CSSProperties
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

export interface TableGroup {
  key: string
  title: string
  description?: string
  icon?: string
  config: TableConfig
  className?: string
  style?: React.CSSProperties
}

export interface ProcessStepDependency {
  step: string
  condition?: {
    field?: string
    value?: any
    custom?: (stepData: any) => boolean
  }
  message?: string
}

export interface ProcessStepTimeout {
  duration: number
  action: "warn" | "block" | "auto-approve" | "auto-reject"
  message?: string
  callback?: (step: string) => void
}

export interface ProcessStepApprovers {
  type: "single" | "multiple" | "any" | "all"
  roles?: string[]
  users?: string[]
  minApprovers?: number
  maxApprovers?: number
  deadline?: number
  notifyType?: "email" | "sms" | "both"
  escalation?: {
    after: number
    to: string[]
  }
}

export interface ProcessStep {
  key: string
  title: string
  description?: string
  icon?: string
  fields?: FormField[]
  dependencies?: ProcessStepDependency[]
  weight?: number
  timeout?: ProcessStepTimeout
  approvers?: ProcessStepApprovers
  className?: string
  style?: React.CSSProperties
}

export interface ProcessStepStatus {
  isCompleted: boolean
  isBlocked: boolean
  blockReason?: string
}

export interface ProcessProgress {
  total: number
  completed: number
  current: number
  percentage: number
  status: {
    [key: string]: ProcessStepStatus
  }
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
  basicFields:
    | FormField[]
    | {
        groups: FormFieldGroup[]
        defaultGroup?: string
      }
  table?: TableConfig
  tables?: TableGroup[]
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
    required?: Array<{ field: string; message: string }>
    invalid?: Array<{ field: string; message: string }>
    other?: Array<{ field: string; message: string }>
  }
}

// 新增：表单状态类型
export interface FormState {
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  errors: Record<string, string>
}

// 新增：表单事件处理器类型
export interface FormEventHandlers {
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  onChange?: (values: any) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}

// 新增：表单校验规则类型
export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  validate?: (value: any) => string | undefined
  message?: string
}

export interface DynamicFormConfig {
  metadata: FormMetadata
  renderConfig: FormRenderConfig
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
  watch?: (form: UseFormReturn<any>) => () => void
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
  validationRules?: Record<string, ValidationRule>  // 新增：表单级别的验证规则
  eventHandlers?: FormEventHandlers  // 新增：表单事件处理器
}

export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  onCancel?: () => void
  templateId?: string
  previewMode?: boolean
}