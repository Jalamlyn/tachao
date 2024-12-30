import { makeAutoObservable } from "mobx"
import { AppPages, AppStores, AppServices, AppModules, AppSchemas } from "../types"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import wpm from "@wpm-js/core"
import React from "react"
import * as ReactRouterDom from "react-router-dom"
import * as FramerMotion from "framer-motion"
import { message } from "antd"
import { ai } from "@/service/ai"
import * as NextUI from "@nextui-org/react"
import { observer } from "mobx-react-lite"
import * as mobx from "mobx"
import { Icon } from "@iconify/react"

// 新增类型定义
interface ShataAICode {
  type: "app" | "page" | "store" | "service" | "module" | "schema"
  code: string
  name?: string
  title?: string
}

interface ParseResult {
  success: boolean
  error?: string
  moduleName?: string
}

type Version = {
  timestamp: number
  content: string
  appState?: {
    pages: AppPages
    stores?: AppStores
    services?: AppServices
    modules?: AppModules
    schemas?: AppSchemas
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

  // 新增方法: 解析单个代码块
  async parseAICode(code: string, context: any): Promise<ParseResult> {
    const wrappedCode = `
      return async (context) => {
        ${code}
      }
    `

    try {
      const moduleFunction = new Function("return " + wrappedCode)()
      await moduleFunction(context)
      return { success: true }
    } catch (error) {
      console.error("Error parsing AI code:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // 新增方法: 执行所有模块
  async executeModules(content: string): Promise<ParseResult[]> {
    const codes = this.extractShataAICodes(content)
    const results: ParseResult[] = []
    let hasAppModule = false

    // 准备 context
    const context = {
      wpm,
      React,
      observer,
      Icon,
      NextUI,
      ReactRouterDom,
      FramerMotion,
      message,
      appId: this.appId,
      api: {
        getMetadata,
        setMetadata,
      },
      ai,
      mobx,
    }

    for (const codeBlock of codes) {
      if (codeBlock.type === "app") {
        if (hasAppModule) {
          results.push({
            success: false,
            error: "Multiple app entry modules found",
          })
          continue
        }
        hasAppModule = true
      }

      const result = await this.parseAICode(codeBlock.code, context)
      results.push(result)
    }

    return results
  }

  // 现有方法
  setAppId(appId: string) {
    this.appId = appId
    this.loadFromStorage()
  }

  addVersion(content: string, appState?: Version["appState"]) {
    if (appState?.version === this.versions[this.versions.length - 1]?.appState?.version) {
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

  getStoreCode(name: string): string | null {
    return this.currentVersion?.appState?.stores?.[name]?.code || null
  }

  getServiceCode(name: string): string | null {
    return this.currentVersion?.appState?.services?.[name]?.code || null
  }

  getModuleCode(name: string): string | null {
    return this.currentVersion?.appState?.modules?.[name]?.code || null
  }

  getSchemaCode(name: string): string | null {
    return this.currentVersion?.appState?.schemas?.[name]?.code || null
  }

  async loadApp(appId: string) {
    try {
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const app = apps.find((a: any) => a.id === appId)
      if (!app) throw new Error("App not found")

      const appResult = await getMetadata([`app_${appId}`])
      const appData = appResult.data?.[0]?.value ? JSON.parse(appResult.data[0].value) : null

      const pages: AppPages = {}
      const stores: AppStores = {}
      const services: AppServices = {}
      const modules: AppModules = {}
      const schemas: AppSchemas = {}

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

      const codeTypes = [
        { type: "store", container: stores },
        { type: "service", container: services },
        { type: "module", container: modules },
        { type: "schema", container: schemas },
      ]

      for (const { type, container } of codeTypes) {
        const typeResult = await getMetadata([`${appId}_${type}s`])
        if (typeResult.data?.[0]?.value) {
          const typeData = JSON.parse(typeResult.data?.[0]?.value || "{}")
          Object.assign(container, typeData)
        }
      }

      if (appData?.code) {
        this.addVersion(appData.code, {
          pages,
          stores,
          services,
          modules,
          schemas,
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
      stores: this.currentVersion.appState?.stores || {},
      services: this.currentVersion.appState?.services || {},
      modules: this.currentVersion.appState?.modules || {},
      schemas: this.currentVersion.appState?.schemas || {},
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
