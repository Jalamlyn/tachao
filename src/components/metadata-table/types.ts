import { MetadataDetail } from "@/hooks/useMetadata"

export interface Column<T = any> {
  key: string
  title: string
  render?: (record: T) => React.ReactNode
}

export interface Action<T = any> {
  key: string
  label: string
  icon?: string
  color?: "primary" | "secondary" | "success" | "warning" | "danger"
  onClick: (record: T) => void | Promise<void>
}

export interface ToolbarConfig {
  // 是否显示搜索框
  showSearch?: boolean
  // 搜索框配置
  searchProps?: {
    placeholder?: string
    fields?: string[] // 搜索字段
  }
  // 是否显示刷新按钮
  showRefresh?: boolean
  // 自定义工具栏内容
  extra?: React.ReactNode
}

export interface MetadataTableProps<T extends MetadataDetail = MetadataDetail> {
  // 元数据类型
  type: string
  // 表格列配置
  columns: Column<T>[]
  // 工具栏配置
  toolbar?: ToolbarConfig
  // 行操作配置
  actions?: Action<T>[]
  // 自定义空状态
  emptyContent?: React.ReactNode
  // 事件回调
  onDataChange?: (data: T[]) => void
  onError?: (error: Error) => void
}