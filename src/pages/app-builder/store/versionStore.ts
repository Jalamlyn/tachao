import { makeAutoObservable } from "mobx"
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

class VersionStore {
  private versions: Version[] = []
  private currentIndex: number = -1
  private appId: string | null = null
  private readonly BASE_STORAGE_KEY = "versionHistory"

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.loadFromStorage()
  }

  // 计算属性
  get currentVersion(): Version | null {
    return this.versions[this.currentIndex] || null
  }

  get currentContent(): string {
    return this.currentVersion?.content || ""
  }

  get canRollback(): boolean {
    return this.currentIndex > 0
  }

  get canForward(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

  // actions
  setAppId(appId: string) {
    this.appId = appId
    this.loadFromStorage()
  }

  addVersion(content: string, appState?: Version["appState"]) {
    // 避免重复版本
    if (appState?.version === this.versions[this.versions.length - 1]?.appState?.version) {
      return
    }

    if (!content?.trim()) {
      console.warn("Attempted to add empty version, skipping...")
      return
    }

    // 清除当前版本之后的所有版本
    this.versions = this.versions.slice(0, this.currentIndex + 1)

    const newVersion: Version = {
      timestamp: Date.now(),
      content,
      appState,
    }

    this.versions.push(newVersion)
    this.currentIndex = this.versions.length - 1
    this.saveToStorage()
  }

  rollback() {
    if (this.canRollback) {
      this.currentIndex--
      this.saveToStorage()
    }
  }

  forward() {
    if (this.canForward) {
      this.currentIndex++
      this.saveToStorage()
    }
  }

  clear() {
    this.versions = []
    this.currentIndex = -1
    localStorage.removeItem(this.getStorageKey())
  }

  getHistory(): Version[] {
    return [...this.versions]
  }

  getPageCode(pageId: string): string | null {
    return this.currentVersion?.appState?.pages[pageId]?.code || null
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

  exportForPublish() {
    if (!this.currentVersion) return null

    return {
      appCode: this.currentVersion.content,
      pages: this.currentVersion.appState?.pages || {},
      version: this.currentVersion.appState?.version || 1,
      updatedAt: new Date().toISOString(),
    }
  }

  // 私有方法
  private getStorageKey(): string {
    return this.appId ? `${this.BASE_STORAGE_KEY}_${this.appId}` : this.BASE_STORAGE_KEY
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
      const stored = localStorage.getItem(this.getStorageKey())
      if (stored) {
        const data = JSON.parse(stored)
        if (Array.isArray(data.versions) && typeof data.currentIndex === "number") {
          this.versions = data.versions
          this.currentIndex = data.currentIndex
        }
      }
    } catch (error) {
      console.error("Error loading version history:", error)
      this.versions = []
      this.currentIndex = -1
    }
  }
}

export const versionStore = new VersionStore()
