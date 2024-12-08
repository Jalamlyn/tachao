import { ReactNode } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormFieldType, ManualInputFieldType, TooltipConfig } from "./basic"

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
  useDataId?: boolean  // 新增:是否使用dataid模式
  loadDataById?: (dataid: string) => Promise<any>  // 新增:根据dataid加载数据
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
      method?: 'GET' | 'POST'
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