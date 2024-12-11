import { ReactNode } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormFieldType, ManualInputFieldType, TooltipConfig } from "./basic"

// 资料字段显示配置
interface ResourceDisplayField {
  key: string // 字段键名
  label: string // 显示标签
  width?: string | number // 表格模式下的列宽
  render?: (value: any) => React.ReactNode // 自定义渲染函数
}

// 资料配置
export interface ResourceConfig {
  resourceTitle?: string // 资料标题（可选）
  resourceId: string // 资料id
  multiple?: boolean // 是否支持多选
  displayMode?: "card" // 显示模式,默认 card
  displayFields?: ResourceDisplayField[] // 显示字段配置,不配置则显示所有字段
  loadDataById?: (dataid: string | string[]) => Promise<any> // 加载数据的方法（已废弃）
  fieldMapping?: {
    [targetField: string]:
      | string
      | {
          field: string
          fields?: string[]
          condition?: (resource: any) => boolean
          transform?: (value: any) => any
        }
  }
}

// 资料字段值类型
export interface ResourceValue {
  dataid: string | string[] // 单个或多个dataid
}

export interface FileInfo {
  fileId: string
  fileName: string
  fileKey: string
  downloadUrl?: string
  type?: string
  size?: number
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
  uploadConfig?: {
    uploadType: "file" | "image" | "video" | "audio"
    multiple?: boolean
    maxSize?: number
    maxCount?: number
    thumbnail?: boolean
    cropOptions?: {
      aspect?: number
      quality?: number
      width?: number
      height?: number
    }
    uploadConfig?: {
      action?: string
      headers?: Record<string, string>
      withCredentials?: boolean
      customRequest?: (options: any) => Promise<any>
    }
    onSuccess?: (fileInfo: FileInfo) => void
    onError?: (error: Error) => void
    onProgress?: (percent: number) => void
    onPreview?: (file: FileInfo) => void
    onDownload?: (file: FileInfo) => void
    previewConfig?: {
      width?: number | string
      height?: number | string
      modalTitle?: string
      modalWidth?: number | string
    }
    downloadConfig?: {
      method?: "GET" | "POST"
      headers?: Record<string, string>
      withCredentials?: boolean
      timeout?: number
    }
  }
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