/**
 * @fileoverview 表格相关类型定义
 * @description 定义了动态表格的相关类型
 * @since 1.0.0
 */

import { ReactNode } from "react"
import { FormFieldType } from "./basic"
import { ResourceConfig } from "./field"

/**
 * 表格列配置
 * @description 定义表格列的属性和行为
 * 
 * @example
 * ```typescript
 * const column: TableColumn = {
 *   key: 'name',
 *   title: '姓名',
 *   type: 'text',
 *   width: 200,
 *   required: true
 * }
 * ```
 */
export interface TableColumn {
  /** 列键名 */
  key: string
  /** 列标题 */
  title: string
  /** 列类型 */
  type: FormFieldType
  /** 列宽度 */
  width?: string | number
  /** 是否可编辑 */
  editable?: boolean
  /** 是否必填 */
  required?: boolean
  /** 占位提示 */
  placeholder?: string
  /** 选项配置 */
  options?: Array<{
    label: string
    value: string | number
  }>
  /** 资源配置 */
  resourceConfig?: ResourceConfig & {
    /** 是否显示触发按钮 */
    showTrigger?: boolean
    /** 触发按钮位置 */
    triggerPosition?: "right" | "cell"
    /** 是否内联显示选择界面 */
    inlineDisplay?: boolean
  }
  /** 自定义渲染函数 */
  render?: (value: any, record: any, index: number) => ReactNode
  /** 汇总配置 */
  summary?: {
    render?: (value: any) => ReactNode
  }
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否为映射字段 */
  isMappedField?: boolean
  /** 映射来源 */
  mappedFrom?: string
}

/**
 * 表格汇总配置
 * @description 配置表格的汇总行
 */
export interface TableSummary {
  /** 是否显示汇总行 */
  show?: boolean
  /** 汇总行标签 */
  label?: string
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 表格配置
 * @description 表格的完整配置
 */
export interface TableConfig {
  /** 列配置 */
  columns: TableColumn[]
  /** 工具栏 */
  toolbar?: ReactNode
  /** 汇总配置 */
  summary?: TableSummary
}

/**
 * 表格分组
 * @description 多表格的分组配置
 * 
 * @example
 * ```typescript
 * const tableGroup: TableGroup = {
 *   key: 'products',
 *   title: '产品列表',
 *   description: '请填写产品信息',
 *   config: {
 *     columns: [
 *       { key: 'name', title: '产品名称', type: 'text' }
 *     ]
 *   }
 * }
 * ```
 */
export interface TableGroup {
  /** 分组键名 */
  key: string
  /** 分组标题 */
  title: string
  /** 分组描述 */
  description?: string
  /** 分组图标 */
  icon?: string
  /** 表格配置 */
  config: TableConfig
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}