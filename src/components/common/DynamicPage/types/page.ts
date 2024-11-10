import type { LayoutConfig } from './layout'

/**
 * 页面元数据配置
 */
export interface PageMetadata {
  title: string
  description?: string
  permissions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
}

/**
 * 组件配置
 */
export interface ComponentConfig {
  type: string
  props?: Record<string, any>
  children?: ContentConfig[]
  layout?: LayoutConfig
  className?: string
  style?: React.CSSProperties
  // 条件渲染
  showWhen?: {
    field: string
    value: any
    operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'contains'
  }
}

/**
 * 内容配置
 */
export type ContentConfig = ComponentConfig | {
  type: 'container'
  layout: LayoutConfig
  children: ContentConfig[]
  className?: string
  style?: React.CSSProperties
}

/**
 * 页面配置
 */
export interface PageConfig {
  metadata: PageMetadata
  layout: LayoutConfig
  content: ContentConfig[]
  state?: {
    initial?: Record<string, any>
    computed?: Record<string, string>
    watchers?: Record<string, {
      watch: string | string[]
      handler: string
      immediate?: boolean
    }>
  }
}

/**
 * 页面上下文
 */
export interface PageContext {
  state: Record<string, any>
  setState: (key: string, value: any) => void
  computed: Record<string, any>
}