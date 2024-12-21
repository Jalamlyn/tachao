import { UseFormReturn } from "react-hook-form"
import { ReactNode } from "react"

// 基础字段配置
export interface BaseField {
  name: string
  label: string
  type: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  tooltip?: TooltipConfig
  description?: string
  style?: FieldStyle
  layout?: "default" | "full-width" | "inline"
  customStyle?: React.CSSProperties
  formatConfig?: FormatConfig
}

// 工具提示配置
export interface TooltipConfig {
  content: string | ReactNode
  placement?: "top" | "bottom" | "left" | "right"
}

// 字段样式配置
export interface FieldStyle {
  width?: string | number
  height?: string | number
  padding?: string | number
  margin?: string | number
  display?: string
  textAlign?: string
  colSpan?: number
  custom?: React.CSSProperties
  sm?: Partial<Record<string, string | number>>
  md?: Partial<Record<string, string | number>>
  lg?: Partial<Record<string, string | number>>
}

// 格式化配置
export interface FormatConfig {
  type: "number" | "currency" | "percentage" | "date" | "custom"
  options?: {
    precision?: number
    currency?: string
    locale?: string
    format?: string
  }
  style?: React.CSSProperties
  formatter?: (value: any) => { formattedValue: string; style?: React.CSSProperties }
}

// 表格配置
export interface TableConfig {
  toolbar?: ReactNode
  columns: TableColumn[]
  summary?: {
    show?: boolean
    firstColumnText?: string
  }
}

// 表格列配置
export interface TableColumn extends BaseField {
  title: string
  width?: string | number
  editable?: boolean
  render?: (value: any, record: any, index: number) => ReactNode
  resourceConfig?: ResourceConfig
  options?: SelectOption[] | ((form: UseFormReturn<any>) => SelectOption[])
  formatConfig?: FormatConfig
}

// 选择项配置
export interface SelectOption {
  label: string | ReactNode
  value: string | number
  disabled?: boolean
}

// 资源配置
export interface ResourceConfig {
  resourceId: string
  multiple?: boolean
  fieldMapping?: Record<string, string | ResourceFieldMapping>
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
  uploadConfig?: {
    customRequest?: (options: { file: File; onProgress: (percent: number) => void }) => Promise<any>
    onProgress?: (percent: number) => void
    onSuccess?: (response: any) => void
    onError?: (error: Error) => void
  }
  downloadConfig?: {
    method?: string
    headers?: Record<string, string>
    withCredentials?: boolean
  }
}

// 资源字段映射
export interface ResourceFieldMapping {
  field: string
  fields?: string[]
  condition?: (resource: any) => boolean
  transform?: (value: any) => any
}

// 资源值
export interface ResourceValue {
  dataid: string | string[]
  displayValue?: string
}

// 文件信息
export interface FileInfo {
  fileName: string
  fileKey?: string
  downloadUrl?: string
  type?: string
}

// 表格渲染属性
export interface TableRenderProps {
  form: UseFormReturn<any>
  isEditable?: boolean
  onChange?: (fieldName: string, value: any) => void
  fieldName: string
}

// 动态表单配置
export interface DynamicFormConfig {
  metadata: {
    title: string
    description?: string
  }
  renderConfig: {
    basicFields: FormField[] | FieldsWithGroups
    tables?: TableConfig
    processSteps?: ProcessStep[]
  }
}

// 表单字段
export interface FormField extends BaseField {
  defaultValue?: any
  min?: number
  max?: number
  step?: number
  accept?: string
  options?: SelectOption[] | ((form: UseFormReturn<any>) => SelectOption[])
  render?: (props: { field: any; form: UseFormReturn<any>; isEditable: boolean }) => ReactNode
  resourceConfig?: ResourceConfig
  uploadConfig?: UploadConfig
  width?: number
  height?: number
  lineWidth?: number
  lineColor?: string
  checkedLabel?: string
  uncheckedLabel?: string
}

// 字段分组
export interface FormFieldGroup {
  key: string
  title: string
  icon?: string
  description?: string
  fields: FormField[]
}

// 字段分组配置
export interface FieldsWithGroups {
  groups: FormFieldGroup[]
  defaultGroup?: string
}

// 上传配置
export interface UploadConfig {
  uploadType: "file" | "image"
  multiple?: boolean
  maxSize?: number
  maxCount?: number
  thumbnail?: boolean
  cropOptions?: {
    quality?: number
  }
  uploadConfig?: {
    customRequest?: (options: { file: File; onProgress: (percent: number) => void }) => Promise<any>
  }
  onProgress?: (percent: number) => void
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
  onPreview?: (file: FileInfo) => void
  onDownload?: (file: FileInfo) => void
  downloadConfig?: {
    method?: string
    headers?: Record<string, string>
    withCredentials?: boolean
  }
}

// 流程步骤
export interface ProcessStep {
  key: string
  title: string
  icon?: string
  description?: string
  fields?: FormField[]
  required?: boolean
  weight?: number
  dependencies?: Array<{
    step: string
    message?: string
    condition?: {
      field?: string
      value?: any
      custom?: (data: any) => boolean
    }
  }>
}

// 流程进度
export interface ProcessProgress {
  total: number
  completed: number
  current: number
  percentage: number
  status: Record<
    string,
    {
      isCompleted: boolean
      isBlocked: boolean
      blockReason?: string
    }
  >
}
