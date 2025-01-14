import { makeAutoObservable } from "mobx"
import { Version, ViewState } from "./types"

// 导入拆分的方法
import { compileCode, extractShataAICodes, processAIResponse, executeModules, addModules } from "./methods/codeMethods"
import { saveToStorage, loadFromStorage, clearStorage } from "./methods/storageMethods"
import { addVersion, rollback, forward, clear } from "./methods/versionMethods"
import { exportToMarkdown, downloadMarkdown } from "./methods/exportMethods"
import { deleteModules, importFromMarkdown } from "./methods/importMethods"
import {
  publishToServer,
  updateAppIndex,
  publishTemplate,
  getLastPublishedVersion,
  rollbackToLastPublished,
} from "./methods/serverMethods"
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
  getContextModules,
  toggleUseSelectedModulesAsContext,
  getSelectedModulesInfo,
} from "./methods/viewMethods"
import { getAppId } from "@/utils"
import globalStore from "@/globalStore"
import { localDB } from "@/utils/localDB"

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
    this.deleteModules = deleteModules.bind(this)
    this.getContextModules = getContextModules.bind(this)
    this.toggleUseSelectedModulesAsContext = toggleUseSelectedModulesAsContext.bind(this)
    this.getSelectedModulesInfo = getSelectedModulesInfo.bind(this)
  }

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

  get hasPublishedVersion(): boolean {
    return this.versions.some((v) => v.app.version > 0)
  }

  setAppId(appId: string) {
    this.#appId = appId
  }

  get appId(): string | null {
    return this.#appId
  }

  // 新增：编译代码方法
  bundleCompiledCode = async (): Promise<string> => {
    if (!this.currentVersion) {
      throw new Error("No current version")
    }

    // 直接遍历所有模块，过滤掉 markdown，合并编译后的代码
    const moduleCodes = Object.values(this.currentVersion.modules)
      .filter(module => module.data.type !== 'markdown')
      .map(module => module.data.compiledCode)
      .filter(Boolean)
      .join('\n\n')

    // 包装在 async 函数中
    const bundleCode = `
window.__MO_APP_${this.appId} = async (context) => {
  try {
    ${moduleCodes}
  } catch (error) {
    console.error('Error executing app:', error)
    throw error
  }
}`

    return bundleCode
  }

  // 新增：编译并上传方法
  compileAndUpload = async (): Promise<string> => {
    try {
      // 1. 合并编译后的代码
      const bundleCode = await this.bundleCompiledCode()
      
      // 2. 生成文件名
      const version = Date.now()
      const fileName = `${this.appId}_${version}.js`
      
      // 3. 上传文件
      const auth = app.auth()
      await auth.signInAnonymously()
      
      const uploadResult = await app.uploadFile({
        cloudPath: `app-bundles/${fileName}`,
        data: new Blob([bundleCode], { type: 'application/javascript' })
      })

      // 4. 获取文件URL
      const urlResult = await app.getTempFileURL({
        fileList: [uploadResult.fileID]
      })

      const fileUrl = urlResult.fileList[0]?.tempFileURL
      if (!fileUrl) {
        throw new Error("Failed to get file URL")
      }

      // 5. 更新当前版本的 bundleUrl
      if (this.currentVersion) {
        this.currentVersion.bundleUrl = fileUrl
        this.currentVersion.app.bundleUrl = fileUrl
      }

      return fileUrl
    } catch (error) {
      console.error("Error compiling and uploading:", error)
      throw error
    }
  }

  clearViewState() {
    this.viewState = initViewState()
  }

  generateId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const pAppId = localDB.getAppId()
    const organizationId = localDB.getOrganizationId()
    return `app_${organizationId}_${pAppId}_${timestamp}_${random}`
  }
}

export const appCodeStore = new AppCodeStore()