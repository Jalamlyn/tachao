import { makeAutoObservable } from "mobx"
import { VersionStore } from "./stores/VersionStore"
import { ModuleStore } from "./stores/ModuleStore"
import { StorageStore } from "./stores/StorageStore"
import { PublishStore } from "./stores/PublishStore"
import { getMetadata } from "@/service/apis/metadata"
import { validateModuleExports, processModuleErrors } from "./utils/validationUtils"
import { downloadMarkdown } from "./utils/exportUtils"
import { Version, AIGenerationResult } from "./types"
import { initialAIResponse } from "../prompts/initTemplate"

class AppCodeStore {
  private versionStore: VersionStore
  private moduleStore: ModuleStore
  private storageStore: StorageStore
  private publishStore: PublishStore

  constructor() {
    this.versionStore = new VersionStore()
    this.moduleStore = new ModuleStore()
    this.storageStore = new StorageStore()
    this.publishStore = new PublishStore()
    makeAutoObservable(this, {}, { autoBind: true })
  }

  // 保持原有的getter
  get currentVersion() {
    return this.versionStore.currentVersion
  }

  get latestVersion() {
    return this.versionStore.latestVersion
  }

  get isViewingHistory() {
    return this.versionStore.isViewingHistory
  }

  get canRollback() {
    return this.versionStore.canRollback
  }

  get canForward() {
    return this.versionStore.canForward
  }

  setAppId(appId: string) {
    this.versionStore.setAppId(appId)
    this.moduleStore.setAppId(appId)
    this.storageStore.setAppId(appId)
    this.publishStore.setAppId(appId)
  }

  private generateId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `app_${timestamp}_${random}`
  }

  async handleAIGeneration(aiResponse: string, name = "New App"): Promise<AIGenerationResult> {
    if (!this.currentVersion) {
      const moduleDataMap = await this.moduleStore.processAIResponse(aiResponse)
      const newVersion: Version = {
        timestamp: Date.now(),
        app: {
          id: this.moduleStore.appId!,
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

      const exportErrors = validateModuleExports(newVersion)
      if (exportErrors.length > 0) {
        return {
          success: false,
          version: newVersion,
          errors: exportErrors,
          moduleErrors: processModuleErrors(exportErrors),
        }
      }

      return {
        success: true,
        version: newVersion,
      }
    }

    // 处理现有版本的更新
    const moduleDataMap = await this.moduleStore.processAIResponse(aiResponse)
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

    const exportErrors = validateModuleExports(newVersion)
    if (exportErrors.length > 0) {
      return {
        success: false,
        version: newVersion,
        errors: exportErrors,
        moduleErrors: processModuleErrors(exportErrors),
      }
    }

    return {
      success: true,
      version: newVersion,
    }
  }

  async loadApp(appId: string) {
    this.setAppId(appId)

    try {
      let version: Version | null = null
      const cached = this.storageStore.loadFromStorage()
      
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

        this.storageStore.saveToStorage(version)
      }

      if (version) {
        for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
          if (!moduleWrapper.data.compiledCode) {
            moduleWrapper.data.compiledCode = await this.moduleStore.compileCode(moduleWrapper.data.code)
          }
        }

        this.versionStore.addVersion(version)
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
      if (!result.success) {
        throw new Error("Failed to create app")
      }
      
      this.versionStore.addVersion(result.version!)
      await this.publishStore.publishToServer(result.version!)
      await this.publishStore.updateAppIndex(result.version!.app, name)
      return appId
    } catch (error) {
      console.error("Error creating app:", error)
      this.clear()
      throw error
    }
  }

  async publishToServer({ useLatest = false } = {}) {
    const versionToPublish = useLatest ? this.latestVersion : this.currentVersion
    if (!versionToPublish) {
      throw new Error("No version to publish")
    }

    await this.publishStore.publishToServer(versionToPublish)
    return {
      success: true,
      publishInfo: {
        hasNewerVersion: !useLatest && this.isViewingHistory,
        versionDate: new Date(versionToPublish.timestamp).toLocaleString(),
      },
      version: versionToPublish.app.version,
      publishedAt: new Date().toISOString(),
    }
  }

  rollback() {
    return this.versionStore.rollback()
  }

  forward() {
    return this.versionStore.forward()
  }

  downloadMarkdown() {
    if (!this.currentVersion || !this.moduleStore.appId) {
      throw new Error("No current version or appId")
    }
    downloadMarkdown(this.currentVersion, this.moduleStore.appId)
  }

  clear() {
    this.versionStore.clear()
    this.storageStore.clearStorage()
    this.setAppId("")
  }

  getDebugInfo() {
    return {
      appId: this.moduleStore.appId,
      versionsCount: this.versionStore.currentIndex + 1,
      currentIndex: this.versionStore.currentIndex,
      currentVersion: this.currentVersion,
      latestVersion: this.latestVersion,
    }
  }
}

export const appCodeStore = new AppCodeStore()