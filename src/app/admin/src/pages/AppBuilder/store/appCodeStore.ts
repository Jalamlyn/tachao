import { makeAutoObservable } from "mobx"
import { transform } from "@/utils/moduleLoader"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { templates } from "../../../../../../prompts/templates"

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
      // 如果更新索引失败，需要抛出错误以便上层处理
      throw new Error("Failed to update app index")
    }
  }
  // 新增导出到Markdown的方法
  exportToMarkdown(): string {
    if (!this.currentVersion) {
      throw new Error("No current version")
    }

    const version = this.currentVersion
    let markdown = "# 应用代码导出\n\n"

    // 模块类型顺序
    const typeOrder = ["app", "page", "store", "service", "module", "schema"]

    // 按类型分组模块
    const modulesByType = typeOrder.reduce(
      (acc, type) => {
        acc[type] = Object.entries(version.modules)
          .filter(([_, module]) => module.data.type === type)
          .sort(([idA], [idB]) => idA.localeCompare(idB))
        return acc
      },
      {} as Record<string, [string, any][]>
    )

    // 生成markdown内容
    typeOrder.forEach((type) => {
      if (modulesByType[type].length > 0) {
        markdown += `\n## ${type.charAt(0).toUpperCase() + type.slice(1)} Modules\n\n`

        modulesByType[type].forEach(([moduleId, module]) => {
          const { data } = module
          markdown += "```jsx\n"

          // 根据不同类型生成不同的标签属性
          let tagAttributes = `type="${type}"`
          if (type === "app") {
            // app类型不需要额外属性
          } else if (type === "page") {
            tagAttributes += ` pageid="${data.name}" title="${data.title || data.name}"`
          } else {
            tagAttributes += ` name="${data.name}"`
            if (data.title) {
              tagAttributes += ` title="${data.title}"`
            }
          }

          markdown += `<mo-ai-code ${tagAttributes}>\n`
          markdown += `${data.code}\n`
          markdown += "</mo-ai-code>\n```\n\n"
        })
      }
    })

    return markdown
  }

  // 导出并下载Markdown文件
  downloadMarkdown(): void {
    try {
      const markdown = this.exportToMarkdown()
      const blob = new Blob([markdown], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${this.appId}_export_${new Date().toISOString().slice(0, 10)}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading markdown:", error)
      throw error
    }
  }
  async executeModules(context: any) {
    if (!this.currentVersion) return []

    const results: Array<{
      success: boolean
      moduleId: string
      type: string
      name: string
      executionTime?: number
      error?: string
      result?: any
    }> = []

    const version = this.currentVersion

    try {
      // 1. 执行所有模块
      for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
        const startTime = performance.now()

        try {
          const moduleData = moduleWrapper.data

          if (!moduleData || !moduleData.compiledCode) {
            throw new Error(`Invalid module data for ${moduleId}`)
          }

          // 执行模块代码并获取返回值
          const moduleFunction = new Function(
            "context",
            `
            ${moduleData.compiledCode.replace(/export default/, "return")}
          `
          )
          const getResult = moduleFunction(context)
          getResult()

          results.push({
            success: true,
            moduleId,
            type: moduleData.type,
            name: moduleData.name,
            executionTime: performance.now() - startTime,
          })
        } catch (error) {
          console.error(`Error executing module ${moduleId}:`, error)
          results.push({
            success: false,
            moduleId,
            type: moduleWrapper.data?.type || "unknown",
            name: moduleWrapper.data?.name || moduleId,
            executionTime: performance.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      return results
    } catch (error) {
      console.error("Error executing modules:", error)
      return [
        {
          success: false,
          moduleId: "unknown",
          type: "unknown",
          name: "unknown",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]
    }
  }
  // 加载应用 - 处理本地状态初始化
  async loadApp(appId: string) {
    this.setAppId(appId)

    try {
      let version: Version | null = null

      // 1. 尝试加载缓存或远程数据
      const cached = this.loadFromStorage()
      if (cached) {
        version = cached
      } else {
        // 加载远程数据
        const appResult = await getMetadata([`${appId}`])
        if (!appResult.data?.[0]?.value) {
          throw new Error("App not found")
        }

        const appData = JSON.parse(appResult.data[0].value)
        const { app } = appData

        // 并发加载所有模块
        const moduleIds = Object.keys(app.modules)
        const moduleResults = await Promise.all(moduleIds.map((moduleId) => getMetadata([moduleId])))

        // 处理模块数据
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

        // 保存到缓存
        this.versions = [version]
        this.currentIndex = 0
        this.saveToStorage()
      }

      // 2. 统一的初始化流程(无论是缓存还是新数据)
      if (version) {
        // 编译所有模块代码
        for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
          if (!moduleWrapper.data.compiledCode) {
            moduleWrapper.data.compiledCode = await this.compileCode(moduleWrapper.data.code)
          }
        }

        // 更新版本状态
        if (!this.versions.length || this.currentIndex === -1) {
          this.versions = [version]
          this.currentIndex = 0
        }
      }

      return version
    } catch (error) {
      console.error("Error in loadApp:", error)
      throw error
    }
  }
  private saveToStorage() {
    try {
      const appId = this.appId
      if (!appId) return

      // 分别存储不同类型的数据
      localStorage.setItem(`${this.getStorageKey()}_app`, JSON.stringify(this.currentVersion?.app))

      // 分别存储每个模块的数据
      Object.entries(this.currentVersion?.modules || {}).forEach(([moduleId, moduleData]) => {
        localStorage.setItem(`${this.getStorageKey()}_module_${moduleId}`, JSON.stringify(moduleData))
      })

      // 存储版本信息
      localStorage.setItem(
        `${this.getStorageKey()}_versions`,
        JSON.stringify({
          versions: this.versions.map((v) => ({
            timestamp: v.timestamp,
            moduleIds: Object.keys(v.modules),
          })),
          currentIndex: this.currentIndex,
        })
      )
    } catch (error) {
      console.error("Error saving to storage:", error)
    }
  }

  private loadFromStorage(): Version | null {
    try {
      const appId = this.appId
      if (!appId) return null

      // 加载版本信息
      const versionsData = localStorage.getItem(`${this.getStorageKey()}_versions`)
      if (!versionsData) return null

      const { versions, currentIndex } = JSON.parse(versionsData)

      // 加载应用数据
      const appData = localStorage.getItem(`${this.getStorageKey()}_app`)
      if (!appData) return null

      // 重建当前版本
      const currentVersion = versions[currentIndex]
      const modules = {}

      // 加载每个模块的数据
      for (const moduleId of currentVersion.moduleIds) {
        const moduleData = localStorage.getItem(`${this.getStorageKey()}_module_${moduleId}`)
        if (moduleData) {
          modules[moduleId] = JSON.parse(moduleData)
        }
      }

      return {
        timestamp: currentVersion.timestamp,
        app: JSON.parse(appData),
        modules,
      }
    } catch (error) {
      console.error("Error loading from storage:", error)
      return null
    }
  }

  private generateId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `app_${timestamp}_${random}`
  }
  // 基础操作方法
  setAppId(appId: string) {
    this.appId = appId
  }
  // 代码提取方法
  extractShataAICodes(content: string): ShataAICode[] {
    try {
      const results: ShataAICode[] = []
      const codeBlocks = content.match(/<mo-ai-code[^>]*>([\s\S]*?)<\/mo-ai-code>/g)

      if (!codeBlocks) return results

      for (const block of codeBlocks) {
        try {
          const typeMatch = block.match(/type="([^"]+)"/)
          if (!typeMatch) continue

          const type = typeMatch[1] as ShataAICode["type"]

          // 提取代码内容
          const codeMatch = block.match(/<mo-ai-code[^>]*>([\s\S]*?)<\/mo-ai-code>/)
          if (!codeMatch) continue

          const code = codeMatch[1].trim()

          // 特殊处理app类型
          if (type === "app") {
            results.push({
              type,
              code,
              name: "entry", // 固定使用entry
              title: "应用入口",
            })
            continue
          }

          // 处理其他类型...
          const nameMatch = block.match(/name="([^"]+)"/)
          const name = nameMatch ? nameMatch[1] : undefined

          const titleMatch = block.match(/title="([^"]+)"/)
          const title = titleMatch ? titleMatch[1] : undefined

          const pageIdMatch = block.match(/pageid="([^"]+)"/)
          const pageid = pageIdMatch ? pageIdMatch[1] : undefined

          if (type === "page" && !pageid) {
            console.warn("Page type requires pageid attribute")
            continue
          }

          if (type !== "page" && !name) {
            console.warn(`${type} type requires name attribute`)
            continue
          }

          results.push({
            type,
            code,
            name: type === "page" ? pageid : name,
            title,
            ...(type === "page" && { pageid }),
          })
        } catch (blockError) {
          console.error("Error processing code block:", blockError)
          continue
        }
      }

      return results
    } catch (error) {
      console.error("Error extracting code blocks:", error)
      throw new Error("Failed to extract code blocks")
    }
  }

  // 将AI响应转换为ModuleData
  async processAIResponse(aiResponse: string): Promise<Record<string, ModuleData>> {
    if (!this.appId) throw new Error("AppId not set")

    try {
      const codeBlocks = this.extractShataAICodes(aiResponse)
      const moduleData: Record<string, ModuleData> = {}

      for (const block of codeBlocks) {
        // 特殊处理app类型
        const moduleId = block.type === "app" ? `${this.appId}_app_entry` : `${this.appId}_${block.type}_${block.name}`

        moduleData[moduleId] = {
          id: moduleId,
          type: block.type,
          name: block.name!,
          title: block.title,
          code: block.code,
          compiledCode: await this.compileCode(block.code),
        }
      }

      return moduleData
    } catch (error) {
      console.error("Error processing AI response:", error)
      throw new Error("Failed to process AI response")
    }
  }

  private validateModuleExports(version: Version): string[] {
    const errors: string[] = []
    const exportedModules = new Set<string>()

    // 首先收集所有已导出的模块
    for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
      const code = moduleWrapper.data.code
      const exportMatch = code.match(/wpm\.export\(['"](.*?)['"]/g)
      if (exportMatch) {
        exportMatch.forEach((match) => {
          const moduleName = match.match(/wpm\.export\(['"](.*?)['"]/)![1]
          exportedModules.add(moduleName)
        })
      }
    }

    // 然后检查所有导入是否都已导出
    for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
      const code = moduleWrapper.data.code
      const importMatch = code.match(/wpm\.import\(['"](.*?)['"]\)/g)
      if (importMatch) {
        importMatch.forEach((match) => {
          const moduleName = match.match(/wpm\.import\(['"](.*?)['"]/)![1]
          if (!exportedModules.has(moduleName)) {
            errors.push(`Module "${moduleId}" imports "${moduleName}" but "${moduleName}" has not been exported`)
          }
        })
      }
    }

    return errors
  }

  // 修改现有方法以使用新的处理逻辑
  async handleAIGeneration(aiResponse: string, name = "New App"): Promise<Version> {
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
          throw new Error(
            `Module export validation failed: Some modules are imported but not exported: ${exportErrors.join(", ")}`
          )
        }

        return newVersion
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
        throw new Error(
          `Module export validation failed: Some modules are imported but not exported: ${exportErrors.join(", ")}`
        )
      }

      return newVersion
    } catch (error) {
      console.error("Error handling AI generation:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to handle AI generation")
    }
  }

  // 辅助方法：验证模块依赖关系
  private validateModuleDependencies(version: Version): string[] {
    const errors: string[] = []
    const moduleIds = new Set(Object.keys(version.modules))

    // 检查每个模块的依赖
    for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
      const code = moduleWrapper.data.code

      // 使用正则表达式查找所有 wpm.import 调用
      const importRegex = /wpm\.import\(['"](.*?)['"]\)/g
      let match

      while ((match = importRegex.exec(code)) !== null) {
        const dependencyId = match[1]

        // 检查依赖模块是否存在
        if (!moduleIds.has(dependencyId)) {
          errors.push(`Module ${moduleId} depends on non-existent module ${dependencyId}`)
        }

        // 检查是否存在循环依赖（简单检查）
        const dependencyCode = version.modules[dependencyId]?.data.code
        if (dependencyCode?.includes(`wpm.import('${moduleId}')`)) {
          errors.push(`Circular dependency detected between ${moduleId} and ${dependencyId}`)
        }
      }
    }

    return errors
  }

  // 创建新的App
  async createApp(name: string, templateId: string = "basic"): Promise<any> {
    const appId = this.generateId()
    this.setAppId(appId)

    try {
      // 1. 获取选择的模板
      const selectedTemplate = templates.find((t) => t.id === templateId)
      if (!selectedTemplate) {
        throw new Error("Template not found")
      }
      const firstVersion = await this.handleAIGeneration(selectedTemplate.template(), name)
      this.addVersion(firstVersion)
      await this.publishToServer({ useLatest: true })
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
      this.updateAppIndex(app, name)
      return appId
    } catch (error) {
      console.error("Error creating app:", error)
      this.clear()
      throw error
    }
  }
  addVersion(newVersion: any) {
    // 更新版本历史
    this.versions = this.versions.slice(0, this.currentIndex + 1)
    this.versions.push(newVersion)
    this.currentIndex = this.versions.length - 1
    this.saveToStorage()
    return newVersion
  }
  // 添加新版本
  async addModules(
    updates: Record<string, string> // moduleId -> new code
  ): Promise<Version> {
    if (!this.currentVersion) {
      throw new Error("No current version")
    }

    try {
      // 1. 处理每个模块的更新
      const updatedModules: Record<string, any> = {}

      for (const [moduleId, newCode] of Object.entries(updates)) {
        // 查找现有模块
        const existingModule = this.currentVersion.modules[moduleId]
        if (!existingModule) {
          throw new Error(`Module ${moduleId} not found`)
        }

        // 编译新代码
        const compiledCode = await this.compileCode(newCode)

        // 更新模块数据,保持原有结构
        updatedModules[moduleId] = {
          data: {
            ...existingModule.data,
            code: newCode,
            compiledCode,
          },
          updatedAt: new Date().toISOString(),
        }
      }

      // 2. 创建新版本
      const newVersion: Version = {
        timestamp: Date.now(),
        app: {
          ...this.currentVersion.app,
          version: Date.now(),
          updatedAt: new Date().toISOString(),
        },
        modules: {
          ...this.currentVersion.modules,
          ...updatedModules,
        },
      }

      // 3. 更新版本历史
      this.versions = this.versions.slice(0, this.currentIndex + 1)
      this.versions.push(newVersion)
      this.currentIndex = this.versions.length - 1

      // 4. 保存到本地存储
      this.saveToStorage()

      return newVersion
    } catch (error) {
      console.error("Error adding modules:", error)
      throw error
    }
  }
  async publishToServer({ useLatest = false } = {}) {
    if (!this.appId) {
      throw new Error("No app id")
    }

    try {
      // 1. 确定要发布的版本
      const versionToPublish = useLatest ? this.latestVersion : this.currentVersion
      if (!versionToPublish) {
        throw new Error("No version to publish")
      }

      // 2. 准备发布信息
      const publishInfo = {
        hasNewerVersion: !useLatest && this.isViewingHistory,
        versionDate: new Date(versionToPublish.timestamp).toLocaleString(),
      }

      // 3. 更新应用数据
      await setMetadata(
        this.appId,
        JSON.stringify({
          app: versionToPublish.app,
          version: versionToPublish.app.version,
          updatedAt: new Date().toISOString(),
        })
      )

      // 4. 并发保存所有模块
      const modulePromises = Object.entries(versionToPublish.modules).map(([moduleId, moduleWrapper]) => {
        return setMetadata(moduleId, JSON.stringify(moduleWrapper.data))
      })
      await Promise.all(modulePromises)

      // 5. 更新应用索引
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      const appIndex = apps.find((app) => app.id === this.appId)
      if (appIndex) {
        appIndex.status = "active"
        appIndex.lastPublishedAt = new Date().toISOString()
        appIndex.version = versionToPublish.app.version
        appIndex.updatedAt = new Date().toISOString()

        await setMetadata("app_index", JSON.stringify(apps))
      }

      return {
        success: true,
        publishInfo,
        version: versionToPublish.app.version,
        publishedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error publishing app:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to publish app")
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
      const { code: compiledCode } = transform(
        `export default async () => {
          ${code}
         }
        `,
        {
          presets: ["react"],
        }
      )
      return compiledCode
    } catch (error) {
      console.error("Error compiling code:", error)
      throw error
    }
  }

  // 添加回滚清理方法
  clear() {
    // 清理内存状态
    this.versions = []
    this.currentIndex = -1

    // 清理本地存储
    if (this.appId) {
      // 获取所有 localStorage 的 key
      const keys = Object.keys(localStorage)

      // 清理所有以 appId 为前缀的存储项
      const prefix = `${this.STORAGE_KEY}_${this.appId}`
      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key)
        }
      })
    }

    // 最后清理 appId
    this.appId = null
  }

  // 开发辅助方法
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
