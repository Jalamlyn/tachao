import { UseFormReturn } from "react-hook-form"
import { ReactNode } from "react"

export interface TooltipConfig {
  content: ReactNode
  placement?: "top" | "bottom" | "left" | "right"
}

export interface FieldStyle {
  width?: string | number
  height?: string | number
  padding?: string | number
  margin?: string | number
  display?: string
  textAlign?: string
  colSpan?: number
  custom?: React.CSSProperties
  className?: string
  sm?: Record<string, string | number>
  md?: Record<string, string | number>
  lg?: Record<string, string | number>
}

export interface FormField {
  name: string
  label: string
  type: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  tooltip?: TooltipConfig
  className?: string
  style?: FieldStyle
  customStyle?: React.CSSProperties
  layout?: "default" | "full-width" | "inline"
  // 新增字段配置
  min?: number
  max?: number
  defaultValue?: any
  description?: string
  // 其他已有配置
  options?: Array<{ label: string; value: string | number; disabled?: boolean }> | ((form: UseFormReturn<any>) => Array<{ label: string; value: string | number; disabled?: boolean }>)
  width?: number
  height?: number
  lineWidth?: number
  lineColor?: string
  checkedLabel?: string
  uncheckedLabel?: string
  step?: number
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxCount?: number
  render?: (props: any) => ReactNode
  resourceConfig?: ResourceConfig
  uploadConfig?: UploadConfig
  formatConfig?: FormatConfig
}

export interface FormFieldGroup {
  key: string
  title: string
  icon?: string
  description?: string
  fields: FormField[]
}

export interface TableColumn extends FormField {
  title: string
  key: string
  width?: number | string
  editable?: boolean
  isMappedField?: boolean
  mappedFrom?: string
  summary?: {
    render: (data: any[]) => ReactNode
  }
}

export interface TableConfig {
  columns: TableColumn[]
  toolbar?: ReactNode
  summary?: {
    show?: boolean
    label?: string
    className?: string
    style?: React.CSSProperties
  }
}

export interface ProcessStep {
  key: string
  title: string
  icon?: string
  description?: string
  fields?: FormField[]
  weight?: number
  required?: boolean
  dependencies?: Array<{
    step: string
    message?: string
    condition?: {
      field?: string
      value?: any
      custom?: (formData: any) => boolean
    }
  }>
}

export interface ProcessProgress {
  total: number
  completed: number
  current: number
  percentage: number
  status: Record<string, {
    isCompleted: boolean
    isBlocked: boolean
    blockReason?: string
  }>
}

export interface ResourceConfig {
  resourceId: string
  multiple?: boolean
  displayField?: string
  displayFormat?: (resource: any) => string
  displayFields?: Array<{
    key: string
    label: string
    render?: (value: any) => ReactNode
  }>
  triggerConfig?: {
    type?: "text" | "icon"
    text?: string
    icon?: string
    className?: string
    style?: React.CSSProperties
  }
  fieldMapping?: Record<string, string | {
    field: string
    fields?: string[]
    transform?: (value: any) => any
    condition?: (resource: any) => boolean
  }>
}

export interface ResourceValue {
  dataid: string | string[]
  displayValue?: string
}

export interface FileInfo {
  fileName: string
  fileKey: string
  downloadUrl: string
  type?: string
}

export interface UploadConfig {
  uploadType: "file" | "image"
  multiple?: boolean
  maxSize?: number
  maxCount?: number
  thumbnail?: boolean
  cropOptions?: {
    aspect?: number
    quality?: number
  }
  uploadConfig?: {
    customRequest?: (options: {
      file: File
      onProgress: (percent: number) => void
    }) => Promise<FileInfo>
  }
  downloadConfig?: {
    method?: string
    headers?: Record<string, string>
    withCredentials?: boolean
  }
  onProgress?: (percent: number) => void
  onSuccess?: (fileInfo: FileInfo) => void
  onError?: (error: Error) => void
  onPreview?: (file: FileInfo) => void
  onDownload?: (file: FileInfo) => void
}

export interface FormatConfig {
  type: "number" | "currency" | "percentage" | "date" | "custom"
  options?: {
    locale?: string
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    dateFormat?: string
    customFormat?: (value: any) => { formattedValue: string; style?: React.CSSProperties }
  }
}

export interface TableRenderProps {
  form: UseFormReturn<any>
  isEditable?: boolean
  onChange?: (fieldName: string, value: any) => void
  fieldName: string
}