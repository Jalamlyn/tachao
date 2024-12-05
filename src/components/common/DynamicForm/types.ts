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

export interface ResourceConfig {
  resourceTitle: string
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
}

export interface FormFieldGroup {
  key: string
  title: string
  fields: FormField[]
  description?: string
  icon?: string
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

export interface TableGroup {
  key: string
  title: string
  description?: string
  icon?: string
  config: TableConfig
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
  action: 'warn' | 'block' | 'auto-approve' | 'auto-reject'
  message?: string
}

export interface ProcessStepApprovers {
  type: 'single' | 'multiple' | 'any' | 'all'
  roles?: string[]
  users?: string[]
  minApprovers?: number
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
  watch?: (form: UseFormReturn<any>) => () => void
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