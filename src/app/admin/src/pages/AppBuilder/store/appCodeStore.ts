import { makeAutoObservable } from "mobx"
import { Version } from "./types"

// 导入拆分的方法
import { compileCode, extractShataAICodes, processAIResponse, executeModules, addModules } from "./methods/codeMethods"
import { saveToStorage, loadFromStorage, clearStorage } from "./methods/storageMethods"
import { addVersion, rollback, forward, clear } from "./methods/versionMethods"
import { exportToMarkdown, downloadMarkdown } from "./methods/exportMethods"
import { importFromMarkdown } from "./methods/importMethods"
import { validateModuleExports, processModuleErrors } from "./methods/validationMethods"
import { publishToServer, updateAppIndex } from "./methods/serverMethods"
import { handleAIGeneration, loadApp, createApp } from "./methods/generationMethods"

class AppCodeStore {
  #appId: string | null = null
  versions: Version[] = []
  currentIndex: number = -1

  constructor() {
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
    this.validateModuleExports = validateModuleExports.bind(this)
    this.processModuleErrors = processModuleErrors.bind(this)
    this.publishToServer = publishToServer.bind(this)
    this.updateAppIndex = updateAppIndex.bind(this)
    this.handleAIGeneration = handleAIGeneration.bind(this)
    this.loadApp = loadApp.bind(this)
    this.createApp = createApp.bind(this)
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
  validateModuleExports!: typeof validateModuleExports
  processModuleErrors!: typeof processModuleErrors
  validateModuleDependencies!: typeof validateModuleDependencies
  publishToServer!: typeof publishToServer
  updateAppIndex!: typeof updateAppIndex
  handleAIGeneration!: typeof handleAIGeneration
  loadApp!: typeof loadApp
  createApp!: typeof createApp

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