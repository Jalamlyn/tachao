import { AppPages } from "../types"

type Version = {
  timestamp: number
  content: string
  appState?: {
    pages: AppPages
    version: number
    updatedAt: string
  }
  description?: string
}

type VersionChangeListener = (content: string) => void
type VersionHistoryListener = () => void

/**
 * 版本控制存储
 * 负责管理编辑器内容和版本历史
 */
class VersionStore {
  private static instance: VersionStore
  private versions: Version[] = []
  private currentIndex: number = -1
  private appId: string | null = null
  private readonly BASE_STORAGE_KEY = "versionHistory"

  // 分离内容更新和历史更新的监听器
  private contentListeners = new Set<VersionChangeListener>()
  private historyListeners = new Set<VersionHistoryListener>()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new VersionStore()
    }
    return this.instance
  }

  // 设置当前应用ID
  setAppId(appId: string) {
    this.appId = appId
    this.loadFromStorage() // 重新加载对应应用的版本历史
    return this
  }

  // 获取存储键
  private getStorageKey(): string {
    return this.appId ? `${this.BASE_STORAGE_KEY}_${this.appId}` : this.BASE_STORAGE_KEY
  }

  // 订阅内容更新
  subscribeToContent(listener: VersionChangeListener) {
    this.contentListeners.add(listener)
    return () => this.contentListeners.delete(listener)
  }

  // 订阅历史更新
  subscribeToHistory(listener: VersionHistoryListener) {
    this.historyListeners.add(listener)
    return () => this.historyListeners.delete(listener)
  }

  private notifyContentListeners(content: string) {
    console.log('Notifying content listeners with content length:', content?.length)
    this.contentListeners.forEach((listener) => listener(content))
  }

  private notifyHistoryListeners() {
    console.log('Notifying history listeners')
    this.historyListeners.forEach((listener) => listener())
  }

  // 保存到本地存储
  private saveToStorage() {
    try {
      localStorage.setItem(
        this.getStorageKey(),
        JSON.stringify({
          versions: this.versions,
          currentIndex: this.currentIndex,
        })
      )
    } catch (error) {
      console.error("Error saving version history:", error)
    }
  }

  // 从本地存储加载
  private loadFromStorage() {
    try {
      console.log('Loading from storage, key:', this.getStorageKey())
      const stored = localStorage.getItem(this.getStorageKey())
      
      if (stored) {
        console.log('Found stored data')
        const data = JSON.parse(stored)
        if (Array.isArray(data.versions) && typeof data.currentIndex === "number") {
          this.versions = data.versions
          this.currentIndex = data.currentIndex
          
          console.log('Loaded versions:', this.versions.length, 'currentIndex:', this.currentIndex)
          
          // 获取当前版本并通知监听器
          const currentVersion = this.getCurrentVersion()
          if (currentVersion) {
            console.log('Current version found, notifying listeners')
            this.notifyContentListeners(currentVersion.content)
            this.notifyHistoryListeners()
          } else {
            console.log('No current version found')
          }
        }
      } else {
        console.log('No stored data found, resetting state')
        this.versions = []
        this.currentIndex = -1
        // 重置状态时也需要通知监听器
        this.notifyContentListeners("")
        this.notifyHistoryListeners()
      }
    } catch (error) {
      console.error("Error loading version history:", error)
      // 发生错误时重置状态并通知监听器
      this.versions = []
      this.currentIndex = -1
      this.notifyContentListeners("")
      this.notifyHistoryListeners()
    }
  }

  /**
   * 添加新版本
   * @param content 版本内容
   * @param appState 应用状态
   * @param description 版本描述
   */
  addVersion(content: string, appState?: Version["appState"], description?: string) {
    if (appState?.version === this.versions?.[this.versions.length - 1]?.appState?.version) {
      return
    }
    // 验证内容
    if (!content?.trim()) {
      console.warn("Attempted to add empty version, skipping...")
      return
    }

    // 移除当前版本之后的所有版本
    this.versions = this.versions.slice(0, this.currentIndex + 1)

    // 添加新版本
    const newVersion: Version = {
      timestamp: Date.now(),
      content,
      appState,
      description,
    }

    this.versions.push(newVersion)

    // 更新当前索引
    this.currentIndex = this.versions.length - 1

    // 保存到本地存储
    this.saveToStorage()

    // 通知更新
    this.notifyContentListeners(content)
    this.notifyHistoryListeners()
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): Version | null {
    return this.versions[this.currentIndex] || null
  }

  /**
   * 获取当前内容
   */
  getCurrentContent(): string {
    return this.getCurrentVersion()?.content || ""
  }

  /**
   * 获取当前应用状态
   */
  getCurrentAppState(): Version["appState"] | undefined {
    return this.getCurrentVersion()?.appState
  }

  /**
   * 获取特定页面的代码
   * @param pageId 页面ID
   * @returns 页面代码或null
   */
  getPageCode(pageId: string): string | null {
    const currentVersion = this.getCurrentVersion()
    return currentVersion?.appState?.pages[pageId]?.code || null
  }

  /**
   * 是否可以回退
   */
  canRollback(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 是否可以前进
   */
  canForward(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

  /**
   * 回退到上一个版本
   */
  rollback(): Version | null {
    if (this.canRollback()) {
      this.currentIndex--
      const version = this.versions[this.currentIndex]
      this.saveToStorage()
      this.notifyContentListeners(version.content)
      this.notifyHistoryListeners()
      return version
    }
    return null
  }

  /**
   * 前进到下一个版本
   */
  forward(): Version | null {
    if (this.canForward()) {
      this.currentIndex++
      const version = this.versions[this.currentIndex]
      this.saveToStorage()
      this.notifyContentListeners(version.content)
      this.notifyHistoryListeners()
      return version
    }
    return null
  }

  /**
   * 清空所有版本
   */
  clear() {
    this.versions = []
    this.currentIndex = -1
    localStorage.removeItem(this.getStorageKey())
    this.notifyContentListeners("")
    this.notifyHistoryListeners()
  }

  /**
   * 获取版本历史
   */
  getHistory(): Version[] {
    return [...this.versions]
  }

  /**
   * 导出发布数据
   */
  exportForPublish() {
    const currentVersion = this.getCurrentVersion()
    if (!currentVersion) return null

    return {
      appCode: currentVersion.content,
      pages: currentVersion.appState?.pages || {},
      version: currentVersion.appState?.version || 1,
      updatedAt: new Date().toISOString(),
    }
  }
}

export const versionStore = VersionStore.getInstance()