import { makeAutoObservable } from "mobx"
import { Version, ViewState } from "./types"

// 使用 import * as 导入所有方法
import * as codeMethods from "./methods/codeMethods"
import * as storageMethods from "./methods/storageMethods"
import * as versionMethods from "./methods/versionMethods"
import * as exportMethods from "./methods/exportMethods"
import * as importMethods from "./methods/importMethods"
import * as serverMethods from "./methods/serverMethods"
import * as generationMethods from "./methods/generationMethods"
import * as viewMethods from "./methods/viewMethods"

import { localDB } from "@/utils/localDB"

class AppCodeStore {
  #appId: string | null = null
  versions: Version[] = []
  currentIndex: number = -1
  viewState: ViewState

  constructor() {
    this.viewState = viewMethods.initViewState()
    makeAutoObservable(this, {}, { autoBind: true })

    // 收集所有方法模块
    const methodModules = {
      ...codeMethods,
      ...storageMethods,
      ...versionMethods,
      ...exportMethods,
      ...importMethods,
      ...serverMethods,
      ...generationMethods,
      ...viewMethods
    }

    // 自动绑定所有方法
    Object.entries(methodModules).forEach(([methodName, method]) => {
      if (typeof method === 'function') {
        this[methodName] = method.bind(this)
      }
    })

    // 保留原有绑定以确保兼容性
    this.compileCode = codeMethods.compileCode.bind(this)
    this.extractShataAICodes = codeMethods.extractShataAICodes.bind(this)
    this.processAIResponse = codeMethods.processAIResponse.bind(this)
    this.executeModules = codeMethods.executeModules.bind(this)
    this.addModules = codeMethods.addModules.bind(this)
    this.saveToStorage = storageMethods.saveToStorage.bind(this)
    this.loadFromStorage = storageMethods.loadFromStorage.bind(this)
    this.clearStorage = storageMethods.clearStorage.bind(this)
    this.addVersion = versionMethods.addVersion.bind(this)
    this.rollback = versionMethods.rollback.bind(this)
    this.forward = versionMethods.forward.bind(this)
    this.clear = versionMethods.clear.bind(this)
    this.exportToMarkdown = exportMethods.exportToMarkdown.bind(this)
    this.downloadMarkdown = exportMethods.downloadMarkdown.bind(this)
    this.importFromMarkdown = importMethods.importFromMarkdown.bind(this)
    this.publishToServer = serverMethods.publishToServer.bind(this)
    this.publishTemplate = serverMethods.publishTemplate.bind(this)
    this.updateAppIndex = serverMethods.updateAppIndex.bind(this)
    this.handleAIGeneration = generationMethods.handleAIGeneration.bind(this)
    this.loadApp = generationMethods.loadApp.bind(this)
    this.createApp = generationMethods.createApp.bind(this)
    this.generateInitialVersion = generationMethods.generateInitialVersion.bind(this)
    this.getLastPublishedVersion = serverMethods.getLastPublishedVersion.bind(this)
    this.rollbackToLastPublished = serverMethods.rollbackToLastPublished.bind(this)
    this.loadContextShortcuts = viewMethods.loadContextShortcuts.bind(this)
    this.applyContextShortcuts = viewMethods.applyContextShortcuts.bind(this)
    this.deleteContextShortcut = viewMethods.deleteContextShortcut.bind(this)
    this.saveContextShortcut = viewMethods.saveContextShortcut.bind(this)

    // 新增: 绑定版本管理相关方法
    this.saveAppVersion = serverMethods.saveAppVersion.bind(this)
    this.getAppVersionHistory = serverMethods.getAppVersionHistory.bind(this)
    this.publishFromVersion = serverMethods.publishFromVersion.bind(this)

    // 绑定视图相关方法
    this.handleCodeSelect = viewMethods.handleCodeSelect.bind(this)
    this.handleSearch = viewMethods.handleSearch.bind(this)
    this.handleSaveEdit = viewMethods.handleSaveEdit.bind(this)
    this.getCodeItems = viewMethods.getCodeItems.bind(this)
    this.getFilteredCodeItems = viewMethods.getFilteredCodeItems.bind(this)
    this.setSearchQuery = viewMethods.setSearchQuery.bind(this)
    this.setSearchContent = viewMethods.setSearchContent.bind(this)
    this.togglePanelCollapse = viewMethods.togglePanelCollapse.bind(this)
    this.setEditMode = viewMethods.setEditMode.bind(this)
    this.updateEditedCode = viewMethods.updateEditedCode.bind(this)
    this.handleCancelEdit = viewMethods.handleCancelEdit.bind(this)
    this.deleteModules = importMethods.deleteModules.bind(this)
    this.getContextModules = viewMethods.getContextModules.bind(this)
    this.toggleUseSelectedModulesAsContext = viewMethods.toggleUseSelectedModulesAsContext.bind(this)
    this.getSelectedModulesInfo = viewMethods.getSelectedModulesInfo.bind(this)
    this.deleteAppVersion = serverMethods.deleteAppVersion.bind(this)
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

  // 保留原有的bundleCompiledCode方法以保持兼容性
  bundleCompiledCode = async (): Promise<string> => {
    if (!this.currentVersion) {
      throw new Error("No current version")
    }

    const processModuleCode = (code: string): string => {
      let processedCode = code.replace(/export\s+default\s+/, "")
      processedCode = processedCode.replace(/;(\s*)$/, "$1")
      if (processedCode.trim().startsWith("async")) {
        return `(${processedCode})();`
      }
      return `(async () => { ${processedCode} })();`
    }

    const moduleCodes = Object.values(this.currentVersion.modules)
      .filter((module) => module.data.type !== "markdown")
      .map((module) => {
        const compiledCode = module.data.compiledCode
        return compiledCode ? processModuleCode(compiledCode) : ""
      })
      .filter(Boolean)
      .join("\n\n")

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

  // 新增: 编译单个模块为独立文件
  compileModuleCode = async (moduleId: string, moduleData: any): Promise<string> => {
    if (!this.appId) throw new Error("No app id")

    let processedCode = moduleData.compiledCode.replace(/export\s+default\s+/, "return ")
    return `
window.__MO_MODULE_${moduleId} = (context) => {
  ${processedCode}
}`
  }

  // 修改: 支持多文件编译和上传
  compileAndUpload = async (): Promise<string[]> => {
    try {
      if (!this.currentVersion) {
        throw new Error("No current version")
      }

      // 1. 编译所有模块
      const moduleCompilations = await Promise.all(
        Object.entries(this.currentVersion.modules)
          .filter(([_, module]) => module.data.type !== "markdown")
          .map(async ([moduleId, module]) => {
            const compiledCode = await this.compileModuleCode(moduleId, module.data)
            return {
              moduleId,
              code: compiledCode,
            }
          })
      )

      // 2. 生成文件名和准备上传
      const version = Date.now()
      const uploads = moduleCompilations.map(async ({ moduleId, code }) => {
        const fileName = `${moduleId}_${version}.js`
        const encoder = new TextEncoder()
        const encodedCode = encoder.encode(code)

        // 3. 进行认证
        const auth = app.auth()
        await auth.signInAnonymously()
        // 3. 上传文件
        const uploadResult = await app.uploadFile({
          cloudPath: `app-bundles/${fileName}`,
          filePath: new Blob([encodedCode], {
            type: "application/javascript;charset=utf-8",
          }),
        })

        // 4. 获取临时URL
        const urlResult = await app.getTempFileURL({
          fileList: [uploadResult.fileID],
        })

        return urlResult.fileList[0]?.tempFileURL
      })

      // 5. 等待所有上传完成
      const urls = await Promise.all(uploads)
      const validUrls = urls.filter(Boolean) as string[]

      if (validUrls.length === 0) {
        throw new Error("Failed to upload module files")
      }

      return validUrls
    } catch (error) {
      console.error("Error compiling and uploading:", error)
      throw error
    }
  }

  clearViewState() {
    this.viewState = viewMethods.initViewState()
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