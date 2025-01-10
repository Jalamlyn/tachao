export type ModuleType = "app" | "page" | "store" | "service" | "module" | "markdown"

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
  data: ModuleData
  updatedAt: string
}

export interface Version {
  timestamp: number
  app: App
  modules: Record<string, ModuleWrapper>
  serverVersion?: number
  lastSyncTime?: number
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
}

export interface ViewState {
  selectedCodeId: string | null
  editedCode: string
  isEditing: boolean
  isPanelCollapsed: boolean
  searchQuery: string
  searchContent: string
  searchResults: Array<{ moduleId: string; matches: number }>
  showImportModal: boolean
  showConfirmModal: boolean
  showVersionInfo: boolean
  showExportModal: boolean // 新增这一行
  importContent: string
  isImporting: boolean
  pendingImportContent: string
  selectedModules: string[]
  showDeleteConfirm: boolean
  useSelectedModulesAsContext: boolean // 新增：是否使用选中模块作为上下文
}

export interface PublishedVersion {
  version: number
  publishedAt: string
  modules: Record<string, ModuleData>
}

export interface AppCodeStore {
  appId: any
  versions: Version[]
  currentIndex: number
  currentVersion: Version | null
  latestVersion: Version | null
  isViewingHistory: boolean
  canRollback: boolean
  canForward: boolean
  viewState: ViewState
  hasPublishedVersion: boolean

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
  setAppId(appId: string): void
  generateId(): string
  getLastPublishedVersion(): Promise<PublishedVersion | null>
  rollbackToLastPublished(): Promise<boolean>
  deleteModules(moduleIds: string[]): Promise<Version>
  getContextModules(): Record<string, ModuleWrapper> // 新增：获取当前上下文模块方法
  toggleUseSelectedModulesAsContext(): void // 新增：切换是否使用选中模块作为上下文
  getSelectedModulesInfo(): Array<{ id: string; name: string; title: string; type: ModuleType }> // 新增：获取选中模块信息
}