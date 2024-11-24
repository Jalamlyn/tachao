export interface AnalysisDataGroup {
  id: string
  title: string
  data: any[]
}

export interface AnalysisData {
  groups: Record<string, AnalysisDataGroup>
  metadata: {
    templateInfoMap: Record<string, string>
    columns: any[]
  }
}

export interface AnalysisResult {
  type: "analyze"
  data: AnalysisData
  analysis: {
    sources: {
      [templateId: string]: {
        id: string
        title: string
      }
    }
    summary: {
      [key: string]: {
        value: number | string
        label: string
        sourceId?: string
        sourceTitle?: string
      }
    }
    charts: Array<{
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
}