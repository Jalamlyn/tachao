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
  | "radio"      // 新增
  | "checkbox"   // 新增
  | "switch"     // 新增
  | "slider"     // 新增

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
  resourceConfig?: ResourceConfig
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
  // 新增 slider 特有配置
  min?: number
  max?: number
  step?: number
  // 新增 switch 特有配置
  checkedLabel?: string
  uncheckedLabel?: string
  // 新增 checkbox/radio 特有配置
  layout?: "horizontal" | "vertical"
  defaultChecked?: boolean
}

[其余代码保持不变...]