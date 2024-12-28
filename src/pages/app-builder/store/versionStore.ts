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
  
  // 分离内容更新和历史更新的监听器
  private contentListeners = new Set<VersionChangeListener>()
  private historyListeners = new Set<VersionHistoryListener>()

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new VersionStore()
    }
    return this.instance
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
    this.contentListeners.forEach(listener => listener(content))
  }

  private notifyHistoryListeners() {
    this.historyListeners.forEach(listener => listener())
  }

  /**
   * 添加新版本
   * @param content 版本内容
   * @param appState 应用状态
   * @param description 版本描述
   */
  addVersion(content: string, appState?: Version['appState'], description?: string) {
    // 移除当前版本之后的所有版本
    this.versions = this.versions.slice(0, this.currentIndex + 1)
    
    // 添加新版本
    this.versions.push({
      timestamp: Date.now(),
      content,
      appState,
      description
    })
    
    // 更新当前索引
    this.currentIndex = this.versions.length - 1
    
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
    return this.getCurrentVersion()?.content || ''
  }

  /**
   * 获取当前应用状态
   */
  getCurrentAppState(): Version['appState'] | undefined {
    return this.getCurrentVersion()?.appState
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
    this.notifyContentListeners('')
    this.notifyHistoryListeners()
  }

  /**
   * 获取版本历史
   */
  getHistory(): Version[] {
    return [...this.versions]
  }
}

export const versionStore = VersionStore.getInstance()