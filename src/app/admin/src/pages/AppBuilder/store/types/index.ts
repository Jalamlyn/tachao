// 应用相关类型定义
export interface App {
  id: string
  name: string
  version: number
  updatedAt: string
  modules: {
    [moduleId: string]: ModuleIndex
  }
}

export interface ModuleIndex {
  id: string
  type: string
  name: string
  title?: string
}

export interface ModuleData {
  id: string
  type: string
  name: string
  title?: string
  code: string
  compiledCode: string
}

export interface Version {
  timestamp: number
  app: App
  modules: {
    [moduleId: string]: {
      metadata: string
      data: ModuleData
      updatedAt: string
    }
  }
}

export interface ShataAICode {
  type: "app" | "page" | "store" | "service" | "module"
  code: string
  name?: string
  title?: string
  pageid?: string
}

export interface AppIndexItem {
  id: string
  title: string
  status: "active" | "draft"
  createdAt: string
  updatedAt: string
  version?: number
  lastPublishedAt?: string
}

export interface AIGenerationResult {
  success: boolean
  version?: Version
  errors?: string[]
  moduleErrors?: {
    missingModules: string[]
    dependentModules: string[]
  }
}