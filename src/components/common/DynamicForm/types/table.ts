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
  resourceConfig?: ResourceConfig & {
    // 新增：表格特定的资源配置
    showTrigger?: boolean // 是否显示触发按钮
    triggerPosition?: "right" | "cell" // 触发按钮位置
    inlineDisplay?: boolean // 是否内联显示选择界面
  }
  render?: (value: any, record: any, index: number) => ReactNode
  summary?: {
    render?: (value: any) => ReactNode
  }
  className?: string
  style?: React.CSSProperties
  isMappedField?: boolean
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
