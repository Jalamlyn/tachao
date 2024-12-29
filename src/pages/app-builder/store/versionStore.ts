import { AppPages } from "../types"
import { getMetadata } from "@/service/apis/metadata"

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

class VersionStore {
  private static instance: VersionStore
  private versions: Version[] = []
  private currentIndex: number = -1
  private appId: string | null = null
  private readonly BASE_STORAGE_KEY = "versionHistory"

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

  setAppId(appId: string) {
    this.appId = appId
    this.loadFromStorage()
    return this
  }

  private getStorageKey(): string {
    return this.appId ? `${this.BASE_STORAGE_KEY}_${this.appId}` : this.BASE_STORAGE_KEY
  }

  subscribeToContent(listener: VersionChangeListener) {
    this.contentListeners.add(listener)
    return () => this.contentListeners.delete(listener)
  }

  subscribeToHistory(listener: VersionHistoryListener) {
    this.historyListeners.add(listener)
    return () => this.historyListeners.delete(listener)
  }

  private notifyContentListeners(content: string) {
    console.log("Notifying content listeners with content length:", content?.length)
    this.contentListeners.forEach((listener) => listener(content))
  }

  private notifyHistoryListeners() {
    console.log("Notifying history listeners")
    this.historyListeners.forEach((listener) => listener())
  }

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

  private loadFromStorage() {
    try {
      console.log("Loading from storage, key:", this.getStorageKey())
      const stored = localStorage.getItem(this.getStorageKey())

      if (stored) {
        console.log("Found stored data")
        const data = JSON.parse(stored)
        if (Array.isArray(data.versions) && typeof data.currentIndex === "number") {
          this.versions = data.versions
          this.currentIndex = data.currentIndex

          console.log("Loaded versions:", this.versions.length, "currentIndex:", this.currentIndex)

          const currentVersion = this.getCurrentVersion()
          debugger
          if (currentVersion) {
            console.log("Current version found, notifying listeners")
            this.notifyContentListeners(currentVersion.content)
            this.notifyHistoryListeners()
          } else {
            console.log("No current version found")
          }
        }
      } else {
        console.log("No stored data found, resetting state")
        this.versions = []
        this.currentIndex = -1
        this.notifyContentListeners("")
        this.notifyHistoryListeners()
      }
    } catch (error) {
      console.error("Error loading version history:", error)
      this.versions = []
      this.currentIndex = -1
      this.notifyContentListeners("")
      this.notifyHistoryListeners()
    }
  }

  async loadApp(appId: string) {
    try {
      // 获取应用信息
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const app = apps.find((a: any) => a.id === appId)
      if (!app) throw new Error("App not found")

      // 获取应用代码
      const appResult = await getMetadata([`app_${appId}`])
      const appData = appResult.data?.[0]?.value ? JSON.parse(appResult.data[0].value) : null

      // 获取所有页面的代码
      const pages: AppPages = {}
      for (const page of app.pages || []) {
        const pageResult = await getMetadata([page.id])
        if (pageResult.data?.[0]?.value) {
          const pageData = JSON.parse(pageResult.data[0].value)
          pages[page.id] = {
            code: pageData.code,
            title: pageData.title,
            updatedAt: pageData.updatedAt,
          }
        }
      }

      // 初始化版本控制
      if (appData?.code) {
        this.addVersion(appData.code, {
          pages,
          version: appData?.version || 1,
          updatedAt: appData?.updatedAt || new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error loading app:", error)
      throw error
    }
  }

  addVersion(content: string, appState?: Version["appState"], description?: string) {
    if (appState?.version === this.versions?.[this.versions.length - 1]?.appState?.version) {
      return
    }
    if (!content?.trim()) {
      console.warn("Attempted to add empty version, skipping...")
      return
    }

    this.versions = this.versions.slice(0, this.currentIndex + 1)

    const newVersion: Version = {
      timestamp: Date.now(),
      content,
      appState,
      description,
    }

    this.versions.push(newVersion)
    this.currentIndex = this.versions.length - 1
    this.saveToStorage()
    this.notifyContentListeners(content)
    this.notifyHistoryListeners()
  }

  getCurrentVersion(): Version | null {
    return this.versions[this.currentIndex] || null
  }

  getCurrentContent(): string {
    return this.getCurrentVersion()?.content || ""
  }

  getCurrentAppState(): Version["appState"] | undefined {
    return this.getCurrentVersion()?.appState
  }

  getPageCode(pageId: string): string | null {
    const currentVersion = this.getCurrentVersion()
    return currentVersion?.appState?.pages[pageId]?.code || null
  }

  canRollback(): boolean {
    return this.currentIndex > 0
  }

  canForward(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

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

  clear() {
    this.versions = []
    this.currentIndex = -1
    localStorage.removeItem(this.getStorageKey())
    this.notifyContentListeners("")
    this.notifyHistoryListeners()
  }

  getHistory(): Version[] {
    return [...this.versions]
  }

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
