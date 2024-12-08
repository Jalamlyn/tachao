import { ReactNode } from "react"
import { FormFieldType } from "./basic"
import { ResourceConfig } from "./field"

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
  // 新增：标识是否为映射字段
  isMappedField?: boolean
  // 新增：映射来源字段
  mappedFrom?: string
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