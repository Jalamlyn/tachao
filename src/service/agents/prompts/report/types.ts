export interface SystemPromptOptions {
  data: any[]
  doc: string
  existingConfig?: string | null
  templateInfoMap?: Record<string, string>
}

export interface DataStructureTemplate {
  groups: Record<string, any[]>
  templateInfoMap: Record<string, string>
}

export interface DataSourceInfo {
  sourceId: string
  sourceTitle: string
  data: any[]
}

export interface AnalysisTemplate {
  type: string
  title: string
  data: any[]
  options?: {
    [key: string]: any
  }
}

export interface PromptTemplate {
  base: {
    roleDefinition: string
    sceneRecognition: string
    thinkingProcess: string
  }
  data: {
    structure: (data: DataStructureTemplate) => string
    statistics: (data: DataStructureTemplate) => string
    source: (data: DataSourceInfo) => string
  }
  analysis: {
    reflection: string
    requirements: string
  }
}