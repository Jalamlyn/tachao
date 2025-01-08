import { makeAutoObservable } from "mobx"
import { Version, ViewState } from "./types"

// 导入拆分的方法
import { compileCode, extractShataAICodes, processAIResponse, executeModules, addModules } from "./methods/codeMethods"
import { saveToStorage, loadFromStorage, clearStorage } from "./methods/storageMethods"
import { addVersion, rollback, forward, clear } from "./methods/versionMethods"
import { exportToMarkdown, downloadMarkdown } from "./methods/exportMethods"
import { importFromMarkdown } from "./methods/importMethods"
import { publishToServer, updateAppIndex, publishTemplate, getLastPublishedVersion, rollbackToLastPublished } from "./methods/serverMethods"
import { handleAIGeneration, loadApp, createApp, generateInitialVersion } from "./methods/generationMethods"
import {
  initViewState,
  handleCodeSelect,
  handleSearch,
  handleSaveEdit,
  getCodeItems,
  getFilteredCodeItems,
  setSearchQuery,
  setSearchContent,
  togglePanelCollapse,
  setEditMode,
  updateEditedCode,
  handleCancelEdit,
} from "./methods/viewMethods"

class AppCodeStore {
  #appId: string | null = null
  versions: Version[] = []
  currentIndex: number = -1
  viewState: ViewState

  constructor() {
    this.viewState = initViewState()

    makeAutoObservable(this, {}, { autoBind: true })

    // 绑定所有方法到实例
    this.compileCode = compileCode.bind(this)
    this.extractShataAICodes = extractShataAICodes.bind(this)
    this.processAIResponse = processAIResponse.bind(this)
    this.executeModules = executeModules.bind(this)
    this.addModules = addModules.bind(this)
    this.saveToStorage = saveToStorage.bind(this)
    this.loadFromStorage = loadFromStorage.bind(this)
    this.clearStorage = clearStorage.bind(this)
    this.addVersion = addVersion.bind(this)
    this.rollback = rollback.bind(this)
    this.forward = forward.bind(this)
    this.clear = clear.bind(this)
    this.exportToMarkdown = exportToMarkdown.bind(this)
    this.downloadMarkdown = downloadMarkdown.bind(this)
    this.importFromMarkdown = importFromMarkdown.bind(this)
    this.publishToServer = publishToServer.bind(this)
    this.publishTemplate = publishTemplate.bind(this)
    this.updateAppIndex = updateAppIndex.bind(this)
    this.handleAIGeneration = handleAIGeneration.bind(this)
    this.loadApp = loadApp.bind(this)
    this.createApp = createApp.bind(this)
    this.generateInitialVersion = generateInitialVersion.bind(this)
    this.getLastPublishedVersion = getLastPublishedVersion.bind(this)
    this.rollbackToLastPublished = rollbackToLastPublished.bind(this)

    // 绑定视图相关方法
    this.handleCodeSelect = handleCodeSelect.bind(this)
    this.handleSearch = handleSearch.bind(this)
    this.handleSaveEdit = handleSaveEdit.bind(this)
    this.getCodeItems = getCodeItems.bind(this)
    this.getFilteredCodeItems = getFilteredCodeItems.bind(this)
    this.setSearchQuery = setSearchQuery.bind(this)
    this.setSearchContent = setSearchContent.bind(this)
    this.togglePanelCollapse = togglePanelCollapse.bind(this)
    this.setEditMode = setEditMode.bind(this)
    this.updateEditedCode = updateEditedCode.bind(this)
    this.handleCancelEdit = handleCancelEdit.bind(this)
  }

  // 新增: 批量删除模块方法
  async deleteModules(moduleIds: string[]): Promise<Version> {
    if (!this.currentVersion) {
      throw new Error("No current version")
    }

    try {
      // 创建新的modules对象,排除要删除的模块
      const updatedModules = { ...this.currentVersion.modules }
      const updatedAppModules = { ...this.currentVersion.app.modules }
      
      moduleIds.forEach(moduleId => {
        // 检查是否为应用入口模块
        if (moduleId === `${this.appId}_app_entry`) {
          throw new Error("Cannot delete app entry module")
        }
        delete updatedModules[moduleId]
        delete updatedAppModules[moduleId]
      })

      // 创建新版本
      const newVersion: Version = {
        timestamp: Date.now(),
        app: {
          ...this.currentVersion.app,
          version: Date.now(),
          updatedAt: new Date().toISOString(),
          modules: updatedAppModules
        },
        modules: updatedModules
      }

      this.addVersion(newVersion)
      return newVersion
    } catch (error) {
      console.error("Error deleting modules:", error)
      throw error
    }
  }

  // 方法声明
  compileCode!: typeof compileCode
  extractShataAICodes!: typeof extractShataAICodes
  processAIResponse!: typeof processAIResponse
  executeModules!: typeof executeModules
  addModules!: typeof addModules
  saveToStorage!: typeof saveToStorage
  loadFromStorage!: typeof loadFromStorage
  clearStorage!: typeof clearStorage
  addVersion!: typeof addVersion
  rollback!: typeof rollback
  forward!: typeof forward
  clear!: typeof clear
  exportToMarkdown!: typeof exportToMarkdown
  downloadMarkdown!: typeof downloadMarkdown
  importFromMarkdown!: typeof importFromMarkdown
  publishToServer!: typeof publishToServer
  publishTemplate!: typeof publishTemplate
  updateAppIndex!: typeof updateAppIndex
  handleAIGeneration!: typeof handleAIGeneration
  loadApp!: typeof loadApp
  createApp!: typeof createApp
  generateInitialVersion!: typeof generateInitialVersion
  getLastPublishedVersion!: typeof getLastPublishedVersion
  rollbackToLastPublished!: typeof rollbackToLastPublished

  // 视图相关方法声明
  handleCodeSelect!: typeof handleCodeSelect
  handleSearch!: typeof handleSearch
  handleSaveEdit!: typeof handleSaveEdit
  getCodeItems!: typeof getCodeItems
  getFilteredCodeItems!: typeof getFilteredCodeItems
  setSearchQuery!: typeof setSearchQuery
  setSearchContent!: typeof setSearchContent
  togglePanelCollapse!: typeof togglePanelCollapse
  setEditMode!: typeof setEditMode
  updateEditedCode!: typeof updateEditedCode
  handleCancelEdit!: typeof handleCancelEdit

  // Getters
  get currentVersion(): Version | null {
    return this.versions[this.currentIndex] || null
  }

  get latestVersion(): Version | null {
    return this.versions[this.versions.length - 1] || null
  }

  get isViewingHistory(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

  get canRollback(): boolean {
    return this.currentIndex > 0
  }

  get canForward(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

  // 新增 getter
  get hasPublishedVersion(): boolean {
    return this.versions.some(v => v.app.version > 0)
  }

  // 设置appId
  setAppId(appId: string) {
    this.#appId = appId
  }

  // 获取appId
  get appId(): string | null {
    return this.#appId
  }

  // 生成ID
  generateId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `app_${timestamp}_${random}`
  }
}

export const appCodeStore = new AppCodeStore()