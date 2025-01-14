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

export interface BundleVersion {
  version: string
  timestamp: number
  urls: string[]
}

export interface App {
  id: string
  name: string
  version: number
  updatedAt: string
  modules: Record<string, AppModule>
  bundleUrl?: string
  bundles?: BundleVersion[] // 新增：存储最近10个版本的bundle信息
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
  bundleUrl?: string
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
  showExportModal: boolean
  importContent: string
  isImporting: boolean
  pendingImportContent: string
  selectedModules: string[]
  showDeleteConfirm: boolean
  useSelectedModulesAsContext: boolean
  isDeletingModules?: boolean
  isCompiling?: boolean
}

export interface PublishedVersion {
  version: number
  publishedAt: string
  modules: Record<string, ModuleData>
  bundleUrl?: string
  bundles?: BundleVersion[]
}

export interface DependencyCheckResult {
  canDelete: boolean
  dependencies: Array<{
    moduleId: string
    name: string
    dependentModules: Array<{
      moduleId: string
      name: string
      title: string
    }>
  }>
}

export interface DependencyCheckProgress {
  current: number
  total: number
  currentModule: string
  status: string
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
  deleteModules(moduleIds: string[], onProgress?: (progress: DependencyCheckProgress) => void): Promise<Version>
  getContextModules(): Record<string, ModuleWrapper>
  toggleUseSelectedModulesAsContext(): void
  getSelectedModulesInfo(): Array<{ id: string; name: string; title: string; type: ModuleType }>
  
  bundleCompiledCode(): Promise<string>
  compileAndUpload(): Promise<string>
}