import { makeAutoObservable } from "mobx"
import { transform } from "@/utils/moduleLoader"
import message from "@/components/Message"

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
  id: string           // ${appId}_${type}_${name}
  type: string        // app/page/store/service/module/schema
  name: string       // 模块名称
  title?: string    // 显示标题
}

export interface ModuleData {
  id: string           // 与索引ID一致
  type: string        // 模块类型
  name: string       // 模块名称
  title?: string    // 显示标题
  code: string     // 原始代码
  compiledCode: string  // 编译后代码
}

export interface Version {
  timestamp: number
  app: App
  modules: Record<string, ModuleData>
}

class AppCodeStore {
  // 基础状态
  private appId: string | null = null
  private versions: Version[] = []
  private currentIndex: number = -1
  
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

  // 基础操作方法
  setAppId(appId: string) {
    this.appId = appId
  }

  // 创建新的App
  async createApp(name: string): Promise<App> {
    if (!this.appId) throw new Error("AppId not set")

    try {
      const app: App = {
        id: this.appId,
        name,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
        modules: {
          // 初始化app入口模块
          [`${this.appId}_app_entry`]: {
            id: `${this.appId}_app_entry`,
            type: "app",
            name: "entry",
            title: name
          }
        }
      }

      // 创建入口模块数据
      const entryModule: ModuleData = {
        id: `${this.appId}_app_entry`,
        type: "app",
        name: "entry",
        title: name,
        code: this.generateInitialAppCode(),
        compiledCode: await this.compileCode(this.generateInitialAppCode())
      }

      // 创建初始版本
      const initialVersion: Version = {
        timestamp: Date.now(),
        app,
        modules: {
          [entryModule.id]: entryModule
        }
      }

      this.versions = [initialVersion]
      this.currentIndex = 0

      return app
    } catch (error) {
      console.error("Error creating app:", error)
      message.error("创建应用失败")
      throw error
    }
  }

  // 添加新版本
  async addVersion(
    newModules: Record<string, ModuleData>
  ): Promise<Version> {
    if (!this.currentVersion) {
      throw new Error("No current version")
    }

    try {
      // 处理模块代码
      const processedModules = await this.processModules(newModules)

      // 更新App对象
      const newApp: App = {
        ...this.currentVersion.app,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
        modules: {
          ...this.currentVersion.app.modules,
          ...Object.fromEntries(
            Object.values(processedModules).map(m => [
              m.id,
              {
                id: m.id,
                type: m.type,
                name: m.name,
                title: m.title
              }
            ])
          )
        }
      }

      // 创建新版本
      const newVersion: Version = {
        timestamp: Date.now(),
        app: newApp,
        modules: {
          ...this.currentVersion.modules,
          ...processedModules
        }
      }

      // 更新版本历史
      this.versions = this.versions.slice(0, this.currentIndex + 1)
      this.versions.push(newVersion)
      this.currentIndex = this.versions.length - 1

      return newVersion
    } catch (error) {
      console.error("Error adding version:", error)
      message.error("添加版本失败")
      throw error
    }
  }

  // 版本控制
  rollback(): Version | null {
    if (this.canRollback) {
      this.currentIndex--
      return this.currentVersion
    }
    return null
  }

  forward(): Version | null {
    if (this.canForward) {
      this.currentIndex++
      return this.currentVersion
    }
    return null
  }

  // 工具方法
  private async compileCode(code: string): Promise<string> {
    try {
      const { code: compiledCode } = transform(code, {
        presets: ["env", "react"]
      })
      return compiledCode
    } catch (error) {
      console.error("Error compiling code:", error)
      throw error
    }
  }

  private async processModules(
    modules: Record<string, ModuleData>
  ): Promise<Record<string, ModuleData>> {
    const processed: Record<string, ModuleData> = {}

    for (const [id, module] of Object.entries(modules)) {
      try {
        processed[id] = {
          ...module,
          compiledCode: await this.compileCode(module.code)
        }
      } catch (error) {
        console.error(`Error processing module ${id}:`, error)
        throw error
      }
    }

    return processed
  }

  private generateInitialAppCode(): string {
    return `
const { wpm, React, ReactRouterDom, observer, appId } = context;
const { BrowserRouter, Routes, Route, Navigate } = ReactRouterDom;

const App = observer(() => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" replace />} />
    </Routes>
  );
});

wpm.export(appId, App);
    `.trim()
  }

  // 开发辅助方法
  getDebugInfo() {
    return {
      appId: this.appId,
      versionsCount: this.versions.length,
      currentIndex: this.currentIndex,
      currentVersion: this.currentVersion,
      latestVersion: this.latestVersion
    }
  }
}

export const appCodeStore = new AppCodeStore()