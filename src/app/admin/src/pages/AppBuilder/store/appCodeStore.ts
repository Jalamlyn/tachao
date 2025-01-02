import { makeAutoObservable } from "mobx"
import { getMetadata } from "@/service/apis/metadata"
import { initialAIResponse } from "../prompts/initTemplate"
import { Version, AIGenerationResult } from "./types"

// 导入拆分的方法
import { compileCode, extractShataAICodes, processAIResponse } from "./methods/codeMethods"
import { saveToStorage, loadFromStorage, clearStorage } from "./methods/storageMethods"
import { addVersion, rollback, forward, clear } from "./methods/versionMethods"
import { exportToMarkdown, downloadMarkdown } from "./methods/exportMethods"
import { validateModuleExports, processModuleErrors } from "./methods/validationMethods"

class AppCodeStore {
  // 基础状态
  private appId: string | null = null
  private versions: Version[] = []
  public currentIndex: number = -1

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })

    // 绑定所有方法到实例
    this.compileCode = compileCode.bind(this)
    this.extractShataAICodes = extractShataAICodes.bind(this)
    this.processAIResponse = processAIResponse.bind(this)
    this.saveToStorage = saveToStorage.bind(this)
    this.loadFromStorage = loadFromStorage.bind(this)
    this.clearStorage = clearStorage.bind(this)
    this.addVersion = addVersion.bind(this)
    this.rollback = rollback.bind(this)
    this.forward = forward.bind(this)
    this.clear = clear.bind(this)
    this.exportToMarkdown = exportToMarkdown.bind(this)
    this.downloadMarkdown = downloadMarkdown.bind(this)
    this.validateModuleExports = validateModuleExports.bind(this)
    this.processModuleErrors = processModuleErrors.bind(this)
  }

  // 方法声明
  compileCode!: typeof compileCode
  extractShataAICodes!: typeof extractShataAICodes
  processAIResponse!: typeof processAIResponse
  saveToStorage!: typeof saveToStorage
  loadFromStorage!: typeof loadFromStorage
  clearStorage!: typeof clearStorage
  addVersion!: typeof addVersion
  rollback!: typeof rollback
  forward!: typeof forward
  clear!: typeof clear
  exportToMarkdown!: typeof exportToMarkdown
  downloadMarkdown!: typeof downloadMarkdown
  validateModuleExports!: typeof validateModuleExports
  processModuleErrors!: typeof processModuleErrors

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
    this.appId = appId
  }

  // 生成ID
  private generateId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `app_${timestamp}_${random}`
  }

  // 主要业务方法
  async handleAIGeneration(aiResponse: string, name = "New App"): Promise<AIGenerationResult> {
    if (!this.appId) {
      throw new Error("AppId not set")
    }

    try {
      const moduleDataMap = await this.processAIResponse(aiResponse)

      if (!this.currentVersion) {
        const newVersion: Version = {
          timestamp: Date.now(),
          app: {
            id: this.appId,
            name,
            version: Date.now(),
            updatedAt: new Date().toISOString(),
            modules: Object.keys(moduleDataMap).reduce(
              (acc, moduleId) => ({
                ...acc,
                [moduleId]: {
                  id: moduleId,
                  type: moduleDataMap[moduleId].type,
                  name: moduleDataMap[moduleId].name,
                  title: moduleDataMap[moduleId].title,
                },
              }),
              {}
            ),
          },
          modules: Object.entries(moduleDataMap).reduce(
            (acc, [moduleId, moduleData]) => ({
              ...acc,
              [moduleId]: {
                metadata: JSON.stringify(moduleData),
                data: moduleData,
                updatedAt: new Date().toISOString(),
              },
            }),
            {}
          ),
        }

        const exportErrors = this.validateModuleExports(newVersion)
        if (exportErrors.length > 0) {
          return {
            success: false,
            version: newVersion,
            errors: exportErrors,
            moduleErrors: this.processModuleErrors(exportErrors),
          }
        }

        return {
          success: true,
          version: newVersion,
        }
      }

      const updatedModules = { ...this.currentVersion.modules }

      for (const [moduleId, moduleData] of Object.entries(moduleDataMap)) {
        updatedModules[moduleId] = {
          metadata: JSON.stringify(moduleData),
          data: moduleData,
          updatedAt: new Date().toISOString(),
        }

        if (!this.currentVersion.app.modules[moduleId]) {
          this.currentVersion.app.modules[moduleId] = {
            id: moduleId,
            type: moduleData.type,
            name: moduleData.name,
            title: moduleData.title,
          }
        }
      }

      const newVersion: Version = {
        timestamp: Date.now(),
        app: {
          ...this.currentVersion.app,
          version: Date.now(),
          updatedAt: new Date().toISOString(),
        },
        modules: updatedModules,
      }

      const exportErrors = this.validateModuleExports(newVersion)
      if (exportErrors.length > 0) {
        return {
          success: false,
          version: newVersion,
          errors: exportErrors,
          moduleErrors: this.processModuleErrors(exportErrors),
        }
      }

      return {
        success: true,
        version: newVersion,
      }
    } catch (error) {
      console.error("Error handling AI generation:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to handle AI generation"],
      }
    }
  }

  async loadApp(appId: string) {
    this.setAppId(appId)

    try {
      let version: Version | null = null
      const cached = this.loadFromStorage()

      if (cached) {
        version = cached
      } else {
        const appResult = await getMetadata([`${appId}`])
        if (!appResult.data?.[0]?.value) {
          throw new Error("App not found")
        }

        const appData = JSON.parse(appResult.data[0].value)
        const { app } = appData

        const moduleIds = Object.keys(app.modules)
        const moduleResults = await Promise.all(moduleIds.map((moduleId) => getMetadata([moduleId])))

        const modules = {}
        moduleResults.forEach((result, index) => {
          const moduleId = moduleIds[index]
          if (result.data?.[0]?.value) {
            const moduleData = JSON.parse(result.data[0].value)
            modules[moduleId] = {
              metadata: result.data[0].value,
              data: moduleData,
              updatedAt: new Date().toISOString(),
            }
          }
        })

        version = {
          timestamp: Date.now(),
          app,
          modules,
        }

        this.saveToStorage()
      }

      if (version) {
        for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
          if (!moduleWrapper.data.compiledCode) {
            moduleWrapper.data.compiledCode = await this.compileCode(moduleWrapper.data.code)
          }
        }

        this.addVersion(version)
      }

      return version
    } catch (error) {
      console.error("Error in loadApp:", error)
      throw error
    }
  }

  async createApp(name: string): Promise<string> {
    const appId = this.generateId()
    this.setAppId(appId)

    try {
      const result = await this.handleAIGeneration(initialAIResponse, name)
      if (!result.success || !result.version) {
        throw new Error("Failed to create app")
      }

      this.addVersion(result.version)
      return appId
    } catch (error) {
      console.error("Error creating app:", error)
      this.clear()
      throw error
    }
  }

  getDebugInfo() {
    return {
      appId: this.appId,
      versionsCount: this.versions.length,
      currentIndex: this.currentIndex,
      currentVersion: this.currentVersion,
      latestVersion: this.latestVersion,
    }
  }
}

export const appCodeStore = new AppCodeStore()