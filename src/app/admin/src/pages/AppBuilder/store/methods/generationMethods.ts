import { getMetadata } from "@/service/apis/metadata"
import { initialAIResponse } from "../../prompts/initTemplate"
import { templates } from "../../prompts/templates"
import { AppCodeStore, Version, AIGenerationResult } from "../types"

async function checkAppNameExists(name: string): Promise<boolean> {
  const appIndexResult = await getMetadata(["app_index"])
  const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
  return apps.some((app) => app.title === name)
}

export async function handleAIGeneration(
  this: AppCodeStore,
  aiResponse: string,
  name = "New App"
): Promise<AIGenerationResult> {
  if (!this.appId) {
    throw new Error("AppId not set")
  }
  try {
    const moduleDataMap = await this.processAIResponse(aiResponse)

    if (!this.currentVersion) {
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

      const exportErrors = this.validateModuleExports(newVersion)
      if (exportErrors.length > 0) {
        return {
          success: false,
          version: newVersion,
          errors: exportErrors,
          moduleErrors: this.processModuleErrors(exportErrors),
        }
      }
      this.addVersion(newVersion)
      return {
        success: true,
        version: newVersion,
      }
    }

    const updatedModules = { ...this.currentVersion.modules }

    for (const [moduleId, moduleData] of Object.entries(moduleDataMap)) {
      updatedModules[moduleId] = {
        metadata: JSON.stringify(moduleData),
        data: moduleData,
        updatedAt: new Date().toISOString(),
      }

      if (!this.currentVersion.app.modules[moduleId]) {
        this.currentVersion.app.modules[moduleId] = {
          id: moduleId,
          type: moduleData.type,
          name: moduleData.name,
          title: moduleData.title,
        }
      }
    }

    const newVersion: Version = {
      timestamp: Date.now(),
      app: {
        ...this.currentVersion.app,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
      },
      modules: updatedModules,
    }

    const exportErrors = this.validateModuleExports(newVersion)
    if (exportErrors.length > 0) {
      return {
        success: false,
        version: newVersion,
        errors: exportErrors,
        moduleErrors: this.processModuleErrors(exportErrors),
      }
    }
    this.addVersion(newVersion)
    return {
      success: true,
      version: newVersion,
    }
  } catch (error) {
    console.error("Error handling AI generation:", error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Failed to handle AI generation"],
    }
  }
}

export async function loadApp(this: AppCodeStore, appId: string) {
  this.setAppId(appId)

  try {
    // 1. 首先获取服务器端的应用元数据
    const appResult = await getMetadata([`${appId}`])
    if (!appResult.data?.[0]?.value) {
      throw new Error("App not found")
    }

    const serverAppData = JSON.parse(appResult.data[0].value)
    const serverVersion = serverAppData.app.version

    // 2. 检查本地缓存
    const cached = this.loadFromStorage()
    const now = Date.now()
    const CACHE_EXPIRE_TIME = 60 * 60 * 1000 // 1小时过期

    // 3. 判断是否可以使用缓存
    const canUseCache = cached && 
      cached.serverVersion === serverVersion && 
      cached.lastSyncTime && 
      (now - cached.lastSyncTime) < CACHE_EXPIRE_TIME

    if (canUseCache) {
      // 使用缓存数据
      console.log("Using cached data")
      for (const [moduleId, moduleWrapper] of Object.entries(cached.modules)) {
        if (!moduleWrapper.data.compiledCode) {
          moduleWrapper.data.compiledCode = await this.compileCode(moduleWrapper.data.code)
        }
      }
      this.addVersion(cached)
      return cached
    }

    // 4. 从服务器加载完整数据
    console.log("Loading from server")
    const moduleIds = Object.keys(serverAppData.app.modules)
    const moduleResults = await Promise.all(
      moduleIds.map((moduleId) => getMetadata([moduleId]))
    )

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

    // 5. 创建新版本
    const newVersion: Version = {
      timestamp: now,
      app: serverAppData.app,
      modules,
      serverVersion,
      lastSyncTime: now
    }

    // 6. 编译代码
    for (const [moduleId, moduleWrapper] of Object.entries(newVersion.modules)) {
      if (!moduleWrapper.data.compiledCode) {
        moduleWrapper.data.compiledCode = await this.compileCode(moduleWrapper.data.code)
      }
    }

    // 7. 保存到缓存
    this.addVersion(newVersion)
    this.saveToStorage()

    return newVersion
  } catch (error) {
    console.error("Error in loadApp:", error)
    
    // 8. 错误处理：如果服务器请求失败但有缓存，使用缓存
    const cached = this.loadFromStorage()
    if (cached) {
      console.warn("Using cached data due to server error")
      this.addVersion(cached)
      return cached
    }
    
    throw error
  }
}

export async function generateInitialVersion(
  this: AppCodeStore,
  aiResponse: string,
  name = "New App"
): Promise<AIGenerationResult> {
  if (!this.appId) {
    throw new Error("AppId not set")
  }

  try {
    const moduleDataMap = await this.processAIResponse(aiResponse)

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

    const exportErrors = this.validateModuleExports(newVersion)
    if (exportErrors.length > 0) {
      return {
        success: false,
        version: newVersion,
        errors: exportErrors,
        moduleErrors: this.processModuleErrors(exportErrors),
      }
    }

    return {
      success: true,
      version: newVersion,
    }
  } catch (error) {
    console.error("Error generating initial version:", error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Failed to generate initial version"],
    }
  }
}

export async function createApp(this: AppCodeStore, name: string, templateId: string = ""): Promise<string> {
  const exists = await checkAppNameExists(name)
  if (exists) {
    throw new Error(`应用名称 "${name}" 已存在`)
  }
  const appId = this.generateId()
  this.setAppId(appId)
  try {
    let aiResponse
    if (templateId && templates[templateId]) {
      aiResponse = templates[templateId].code
    } else {
      aiResponse = initialAIResponse
    }

    // 使用新的方法替代handleAIGeneration
    const result = await this.generateInitialVersion(aiResponse, name)
    if (!result.success || !result.version) {
      throw new Error("Failed to create app")
    }

    // 只在这里执行一次addVersion
    this.addVersion(result.version)
    await this.publishToServer({ useLatest: true })
    await this.updateAppIndex(result.version.app, name)
    return appId
  } catch (error) {
    console.error("Error creating app:", error)
    this.clear()
    throw error
  }
}

// 添加手动刷新方法
export async function refreshApp(this: AppCodeStore) {
  if (!this.appId) {
    throw new Error("No app id")
  }

  // 清除缓存
  this.clearStorage()
  
  // 重新加载
  return this.loadApp(this.appId)
}