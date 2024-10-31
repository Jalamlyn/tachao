import { ReactNode } from "react"
import { z } from "zod"

export type FieldType = "text" | "number" | "resource" | "file" | "custom" | "date"

export interface BaseField {
  name: string
  label: string
  type: FieldType
  required?: boolean
  defaultValue?: any
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  customComponent?: ReactNode
  validators?: Array<(value: any) => string | undefined>
}

export interface ResourceField extends BaseField {
  type: "resource"
  resourceName: string
  appId: string
  selectionMode?: "single" | "multiple"
  onSelect?: (selected: any[]) => void
}

export interface FileField extends BaseField {
  type: "file"
  accept?: string
  maxSize?: number
  onUpload?: (file: File) => Promise<void>
}

export interface DateField extends BaseField {
  type: "date"
  minDate?: Date
  maxDate?: Date
  format?: string
  showTime?: boolean
}

export interface CustomField extends BaseField {
  type: "custom"
  render: (props: any) => ReactNode
}

export type FormField = BaseField | ResourceField | FileField | DateField | CustomField

export interface TableColumn {
  key: string
  title: string
  type: FieldType
  width?: number | string
  required?: boolean
  editable?: boolean
  render?: (value: any, record: any, index: number) => ReactNode
  resourceConfig?: {
    resourceName: string
    appId: string
    selectionMode?: "single" | "multiple"
  }
  fileConfig?: {
    accept?: string
    maxSize?: number
  }
  dateConfig?: {
    minDate?: Date
    maxDate?: Date
    format?: string
    showTime?: boolean
  }
}

export interface TableSummary {
  fields: {
    [key: string]: {
      label: string
      calculate: (records: any[]) => number | string
    }
  }
}

export interface TableConfig {
  columns: TableColumn[]
  summary?: TableSummary
  rowCalculations?: {
    [key: string]: (record: any) => number | string
  }
  toolbar?: ReactNode
  operations?: {
    render: (record: any, index: number) => ReactNode
  }
}

export interface ProcessStep {
  key: string
  title: string
  description?: string
  fields?: FormField[]
  onConfirm?: (data: any) => Promise<void>
  onCancel?: () => void
}

export interface DynamicFormConfig {
  formFields: {
    [section: string]: FormField[]
  }
  table?: TableConfig
  processSteps?: ProcessStep[]
  dependencies?: {
    [fieldName: string]: {
      dependsOn: string[]
      calculate: (values: any) => any
    }
  }
  customValidators?: {
    [fieldName: string]: (value: any, allValues: any) => string | undefined
  }
}

export interface DynamicFormProps {
  config: DynamicFormConfig
  initialValues?: any
  onSubmit?: (values: any) => Promise<void>
  onValuesChange?: (changedValues: any, allValues: any) => void
  isEditable?: boolean
}