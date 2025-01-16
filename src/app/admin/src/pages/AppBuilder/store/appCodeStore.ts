import { makeAutoObservable } from "mobx"
import { Version, ViewState } from "./types"

// 使用 import * as 导入所有方法
import * as codeMethods from "./methods/codeMethods"
import * as storageMethods from "./methods/storageMethods"
import * as versionMethods from "./methods/versionMethods"
import * as exportMethods from "./methods/exportMethods"
import * as importMethods from "./methods/importMethods"
import * as serverMethods from "./methods/serverMethods"
import * as generationMethods from "./methods/generationMethods"
import * as viewMethods from "./methods/viewMethods"

import { localDB } from "@/utils/localDB"

function checkMethodConflicts(modules: Record<string, any>) {
  const methodNames = new Set()
  Object.keys(modules).forEach((name) => {
    if (methodNames.has(name)) {
      throw new Error(`Method name conflict: ${name}`)
    }
    methodNames.add(name)
  })
}

class AppCodeStore {
  #appId: string | null = null
  versions: Version[] = []
  currentIndex: number = -1
  viewState: ViewState
  // 新增: 变更消息数组
  changeMessages: ChangeMessage[] = []

  constructor() {
    this.viewState = viewMethods.initViewState()
    makeAutoObservable(this, {}, { autoBind: true })

    // 收集所有方法模块
    const methodModules = {
      ...codeMethods,
      ...storageMethods,
      ...versionMethods,
      ...exportMethods,
      ...importMethods,
      ...serverMethods,
      ...generationMethods,
      ...viewMethods,
    }

    checkMethodConflicts(methodModules)
    // 自动绑定所有方法
    Object.entries(methodModules).forEach(([methodName, method]) => {
      if (typeof method === "function") {
        this[methodName] = method.bind(this)
      }
    })
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

  get hasPublishedVersion(): boolean {
    return this.versions.some((v) => v.app.version > 0)
  }

  setAppId(appId: string) {
    this.#appId = appId
  }

  get appId(): string | null {
    return this.#appId
  }
  // 新增: 变更消息管理方法
  addChangeMessage(message: ChangeMessage) {
    this.changeMessages.push({
      ...message,
      timestamp: Date.now(),
    })
  }

  clearChangeMessages() {
    this.changeMessages = []
  }

  getChangeMessages(): ChangeMessage[] {
    return [...this.changeMessages]
  }
  // 新增: 编译单个模块为独立文件
  compileModuleCode = async (moduleId: string, moduleData: any): Promise<string> => {
    if (!this.appId) throw new Error("No app id")

    let processedCode = moduleData.compiledCode.replace(/export\s+default\s+/, "return ")
    return `
window.__MO_MODULE_${moduleId} = (context) => {
  ${processedCode}
}`
  }

  // 修改: 支持多文件编译和上传
  compileAndUpload = async (): Promise<string[]> => {
    try {
      if (!this.currentVersion) {
        throw new Error("No current version")
      }

      // 1. 编译所有模块
      const moduleCompilations = await Promise.all(
        Object.entries(this.currentVersion.modules)
          .filter(([_, module]) => module.data.type !== "markdown")
          .map(async ([moduleId, module]) => {
            const compiledCode = await this.compileModuleCode(moduleId, module.data)
            return {
              moduleId,
              code: compiledCode,
            }
          })
      )

      // 2. 生成文件名和准备上传
      const version = Date.now()
      const uploads = moduleCompilations.map(async ({ moduleId, code }) => {
        const fileName = `${moduleId}_${version}.js`
        const encoder = new TextEncoder()
        const encodedCode = encoder.encode(code)

        // 3. 进行认证
        const auth = app.auth()
        await auth.signInAnonymously()
        // 3. 上传文件
        const uploadResult = await app.uploadFile({
          cloudPath: `app-bundles/${fileName}`,
          filePath: new Blob([encodedCode], {
            type: "application/javascript;charset=utf-8",
          }),
        })

        // 4. 获取临时URL
        const urlResult = await app.getTempFileURL({
          fileList: [uploadResult.fileID],
        })

        return urlResult.fileList[0]?.tempFileURL
      })

      // 5. 等待所有上传完成
      const urls = await Promise.all(uploads)
      const validUrls = urls.filter(Boolean) as string[]

      if (validUrls.length === 0) {
        throw new Error("Failed to upload module files")
      }

      return validUrls
    } catch (error) {
      console.error("Error compiling and uploading:", error)
      throw error
    }
  }

  clearViewState() {
    this.viewState = viewMethods.initViewState()
  }

  generateId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const pAppId = localDB.getAppId()
    const organizationId = localDB.getOrganizationId()
    return `app_${organizationId}_${pAppId}_${timestamp}_${random}`
  }
}

export const appCodeStore = new AppCodeStore()
