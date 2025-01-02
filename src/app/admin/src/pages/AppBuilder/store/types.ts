export type ModuleType = "app" | "page" | "store" | "service" | "module"

export interface ModuleData {
  id: string
  type: ModuleType
  name: string
  title?: string
  code: string
  compiledCode?: string
}

export interface AppModule {
  id: string
  type: ModuleType
  name: string
  title?: string
}

export interface App {
  id: string
  name: string
  version: number
  updatedAt: string
  modules: Record<string, AppModule>
}

export interface ModuleWrapper {
  metadata: string
  data: ModuleData
  updatedAt: string
}

export interface Version {
  timestamp: number
  app: App
  modules: Record<string, ModuleWrapper>
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

export interface ShataAICode {
  type: ModuleType
  code: string
  name?: string
  title?: string
  pageid?: string
}

// 为 AppCodeStore 定义 this 类型
export interface AppCodeStore {
  private appId: string | null
  versions: Version[]
  currentIndex: number
  currentVersion: Version | null
  latestVersion: Version | null
  isViewingHistory: boolean
  canRollback: boolean
  canForward: boolean

  // 方法声明
  compileCode(code: string): Promise<string>
  extractShataAICodes(content: string): ShataAICode[]
  processAIResponse(aiResponse: string): Promise<Record<string, ModuleData>>
  saveToStorage(): void
  loadFromStorage(): Version | null
  clearStorage(): void
  addVersion(version: Version): Version
  rollback(): Version | null
  forward(): Version | null
  clear(): void
  exportToMarkdown(): string
  downloadMarkdown(): void
  validateModuleExports(version: Version): string[]
  processModuleErrors(errors: string[]): { missingModules: string[]; dependentModules: string[] }
  setAppId(appId: string): void
  generateId(): string
}