export interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
  code?: {
    preview?: React.ReactNode
    content?: string
  }
}

// 多数据源支持的类型定义
export interface DataSourceInfo {
  id: string
  title: string
}

export interface MultiSourceSummaryItem {
  value: number | string | Record<string, any>
  label: string
  sourceId?: string
  sourceTitle?: string
}

export interface MultiSourceAnalysisResult {
  sources?: {
    [templateId: string]: {
      id: string
      title: string
    }
  }
  summary: Record<string, MultiSourceSummaryItem>
  charts?: Array<{
    type: string
    title: string
    data: Array<{
      name: string
      value: number
      sourceId?: string
      sourceTitle?: string
    }>
  }>
  insights: Array<{
    content: string
    sourceIds?: string[]
  }>
}