import { ReactNode } from 'react'

export type FieldType = 
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'upload'
  | 'custom'

export type FormMode = 'read' | 'write' | 'create'

export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  message?: string
  validator?: (value: any) => boolean | Promise<boolean>
  min?: number
  max?: number
}

export interface FieldConfig {
  type: FieldType
  label: string
  name: string
  defaultValue?: any
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  rules?: ValidationRule[]
  options?: Array<{
    label: string
    value: any
  }>
  props?: Record<string, any>
  span?: number
  printable?: boolean
}

export interface TableColumnConfig extends FieldConfig {
  width?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
}

export interface TableConfig {
  name: string
  label: string
  columns: TableColumnConfig[]
  addable?: boolean
  removable?: boolean
  defaultRows?: number
}

export interface ProcessStepConfig {
  title: string
  description?: string
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  operator?: string
  timestamp?: string
  comments?: string
}

export interface PrintConfig {
  pageSize?: 'A4' | 'A3' | 'letter'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  header?: {
    height?: number
    content?: string | ReactNode
  }
  footer?: {
    height?: number
    content?: string | ReactNode
  }
}

export interface FormBuilderConfig {
  formId?: string
  title: string
  description?: string
  mode?: FormMode
  
  layout?: {
    labelCol?: { span: number }
    wrapperCol?: { span: number }
  }

  basicInfo: {
    title?: string
    description?: string
    fields: FieldConfig[]
  }

  tables?: {
    title?: string
    description?: string
    tables: TableConfig[]
  }

  process?: {
    title?: string
    description?: string
    steps: ProcessStepConfig[]
  }

  print?: PrintConfig

  api?: {
    fetch?: string
    submit?: string
    validate?: string
  }

  handlers?: {
    onSubmit?: (values: any) => Promise<void>
    onChange?: (values: any) => void
    onValidate?: (values: any) => Promise<boolean>
  }
}

export interface FormBuilderProps {
  config: FormBuilderConfig
  id?: string
}