import { makeAutoObservable } from "mobx"
import { transform } from "@/utils/moduleLoader"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { templates } from "../templates"

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

class AppCodeStore {
  // 基础状态
  private appId: string | null = null
  private versions: Version[] = []
  private currentIndex: number = -1
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
      // 如果更新索引失败，需要抛出错误以便上层处理
      throw new Error("Failed to update app index")
    }
  }

  // 其他方法...
  [其他现有方法保持不变]

  // 修改创建应用方法以支持模板
  async createApp(name: string, templateId: string = 'basic'): Promise<{ app: App; initialVersion: Version }> {
    const appId = this.generateId()
    this.setAppId(appId)

    try {
      // 1. 获取选择的模板
      const selectedTemplate = templates.find(t => t.id === templateId)
      if (!selectedTemplate) {
        throw new Error('Template not found')
      }

      // 2. 创建入口模块数据
      const entryModule: ModuleData = {
        id: `${appId}_app_entry`,
        type: "app",
        name: "entry",
        title: name,
        code: selectedTemplate.template(),
        compiledCode: await this.compileCode(selectedTemplate.template()),
      }

      // 3. 创建App对象
      const app: App = {
        id: appId,
        name,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
        modules: {
          [`${appId}_app_entry`]: {
            id: `${appId}_app_entry`,
            type: "app",
            name: "entry",
            title: name,
          },
        },
      }

      // 4. 创建初始版本
      const initialVersion: Version = {
        timestamp: Date.now(),
        app,
        modules: {
          [entryModule.id]: {
            metadata: JSON.stringify(entryModule),
            data: entryModule,
            updatedAt: new Date().toISOString(),
          },
        },
      }

      // 5. 保存所有数据
      await Promise.all([
        setMetadata(
          `${appId}`,
          JSON.stringify({
            app,
            version: initialVersion.app.version,
            updatedAt: initialVersion.app.updatedAt,
          })
        ),
        setMetadata(entryModule.id, JSON.stringify(entryModule)),
        this.updateAppIndex(app, name),
      ])

      // 6. 设置初始版本
      this.versions = [initialVersion]
      this.currentIndex = 0

      // 7. 保存到本地存储
      this.saveToStorage()

      return { app, initialVersion }
    } catch (error) {
      console.error("Error creating app:", error)
      this.clear()
      throw error
    }
  }
}

export const appCodeStore = new AppCodeStore()