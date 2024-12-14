/**
 * @fileoverview 汇总信息相关类型定义
 */

import { ReactNode } from "react"

export type SummaryFieldType = 
  | 'amount'      // 金额
  | 'percentage'  // 百分比
  | 'text'        // 文本
  | 'number'      // 数字

export interface SummaryField {
  name: string
  label: string
  type: SummaryFieldType
  precision?: number
  trend?: 'up' | 'down' | 'stable'
  style?: React.CSSProperties
  format?: (value: any) => ReactNode
}

export interface SummaryGroup {
  key: string
  title: string
  icon?: string
  description?: string
  fields: SummaryField[]
  layout?: 'grid' | 'flow'
  columns?: number
}

export interface SummaryProps {
  groups: SummaryGroup[]
  values: Record<string, any>
  className?: string
  style?: React.CSSProperties
}