// ... 保留原有的导入和其他类型定义 ...

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
  | "upload"  // 新增 upload 类型

// ... 保留中间的类型定义 ...

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
  // 新增上传字段配置
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
  }
}

// ... 保留其他类型定义 ...