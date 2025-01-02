import { makeAutoObservable } from "mobx"
import { transform } from "@/utils/moduleLoader"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { initialAIResponse } from "../prompts/initTemplate"

// 类型定义
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
  id: string // ${appId}_${type}_${name}
  type: string // app/page/store/service/module/schema
  name: string // 模块名称
  title?: string // 显示标题
}

export interface ModuleData {
  id: string // 与索引ID一致
  type: string // 模块类型
  name: string // 模块名称
  title?: string // 显示标题
  code: string // 原始代码
  compiledCode: string // 编译后代码
}

interface Version {
  timestamp: number
  app: App
  modules: {
    [moduleId: string]: {
      metadata: string // 原始元数据
      data: ModuleData // 解析后的数据
      updatedAt: string
    }
  }
}

// 代码提取相关的接口定义
interface ShataAICode {
  type: "app" | "page" | "store" | "service" | "module" | "schema"
  code: string
  name?: string
  title?: string
  pageid?: string // 用于page类型
}

interface AppIndexItem {
  id: string
  title: string
  status: "active" | "draft"
  createdAt: string
  updatedAt: string
  version?: number
  lastPublishedAt?: string
}

// 新增错误处理相关接口
interface AIGenerationResult {
  success: boolean
  version?: Version
  errors?: string[]
  moduleErrors?: {
    missingModules: string[]
    dependentModules: string[]
  }
}

class AppCodeStore {
  // 基础状态
  private appId: string | null = null
  private versions: Version[] = []
  public currentIndex: number = -1
  private readonly STORAGE_KEY = "appCode"

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
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

  // 缓存相关方法
  private getStorageKey(): string {
    return this.appId ? `${this.STORAGE_KEY}_${this.appId}` : this.STORAGE_KEY
  }

  private async updateAppIndex(app: App, name: string): Promise<void> {
    try {
      // 1. 获取现有的应用索引
      const appIndexResult = await getMetadata(["app_index"])
      const apps: AppIndexItem[] = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      // 2. 创建新的应用索引项
      const newAppIndex: AppIndexItem = {
        id: app.id,
        title: name,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: app.version,
      }

      // 3. 添加到索引列表
      const updatedApps = [...apps, newAppIndex]

      // 4. 保存更新后的索引
      await setMetadata("app_index", JSON.stringify(updatedApps))
    } catch (error) {
      console.error("Error updating app index:", error)
      throw new Error("Failed to update app index")
    }
  }

  // 改进的错误处理方法
  private processModuleErrors(errors: string[]): { missingModules: string[]; dependentModules: string[] } {
    const missingModules: string[] = []
    const dependentModules: string[] = []

    errors.forEach((error) => {
      const match = error.match(/Module "(.*?)" imports "(.*?)" but/)
      if (match) {
        dependentModules.push(match[1])
        missingModules.push(match[2])
      }
    })

    return {
      missingModules: [...new Set(missingModules)],
      dependentModules: [...new Set(dependentModules)]
    }
  }

  // 改进的AI响应处理方法
  async handleAIGeneration(aiResponse: string, name = "New App"): Promise<AIGenerationResult> {
    if (!this.appId) {
      throw new Error("AppId not set")
    }

    try {
      // 1. 处理AI响应获取新的ModuleData
      const moduleDataMap = await this.processAIResponse(aiResponse)

      // 2. 获取当前版本作为基础
      const currentVersion = this.currentVersion
      if (!currentVersion) {
        // 如果没有当前版本，创建新的版本
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

        // 验证模块的导入导出一致性
        const exportErrors = this.validateModuleExports(newVersion)
        if (exportErrors.length > 0) {
          return {
            success: false,
            version: newVersion, // 仍然返回版本,允许使用生成的代码
            errors: exportErrors,
            moduleErrors: this.processModuleErrors(exportErrors)
          }
        }

        return {
          success: true,
          version: newVersion
        }
      }

      // 3. 合并现有版本和新模块
      const updatedModules = { ...currentVersion.modules }

      // 4. 处理每个新模块
      for (const [moduleId, moduleData] of Object.entries(moduleDataMap)) {
        // 编译新代码
        const compiledCode = await this.compileCode(moduleData.code)

        // 更新或添加模块
        updatedModules[moduleId] = {
          metadata: JSON.stringify(moduleData),
          data: {
            ...moduleData,
            compiledCode,
          },
          updatedAt: new Date().toISOString(),
        }

        // 如果是新模块，添加到app.modules索引中
        if (!currentVersion.app.modules[moduleId]) {
          currentVersion.app.modules[moduleId] = {
            id: moduleId,
            type: moduleData.type,
            name: moduleData.name,
            title: moduleData.title,
          }
        }
      }

      // 5. 创建新版本，保持未修改的模块不变
      const newVersion: Version = {
        timestamp: Date.now(),
        app: {
          ...currentVersion.app,
          version: Date.now(),
          updatedAt: new Date().toISOString(),
        },
        modules: updatedModules,
      }

      // 验证模块的导入导出一致性
      const exportErrors = this.validateModuleExports(newVersion)
      if (exportErrors.length > 0) {
        return {
          success: false,
          version: newVersion, // 仍然返回版本,允许使用生成的代码
          errors: exportErrors,
          moduleErrors: this.processModuleErrors(exportErrors)
        }
      }

      return {
        success: true,
        version: newVersion
      }
    } catch (error) {
      console.error("Error handling AI generation:", error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Failed to handle AI generation"]
      }
    }
  }

  // 保持其他方法不变...
  [其他现有方法保持不变]
}

export const appCodeStore = new AppCodeStore()