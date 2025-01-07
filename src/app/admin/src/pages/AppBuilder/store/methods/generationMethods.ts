import { getMetadata, getPlatMetaData } from "@/service/apis/metadata"
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
    let version: Version | null = null
    const cached = this.loadFromStorage()

    if (cached) {
      version = cached
    } else {
      const appResult = await getMetadata([`${appId}`])
      if (!appResult.data?.[0]?.value) {
        throw new Error("App not found")
      }

      const appData = JSON.parse(appResult.data[0].value)
      const { app } = appData

      const moduleIds = Object.keys(app.modules)
      const moduleResults = await Promise.all(moduleIds.map((moduleId) => getMetadata([moduleId])))

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

      this.saveToStorage()
    }

    if (version) {
      for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
        if (!moduleWrapper.data.compiledCode) {
          moduleWrapper.data.compiledCode = await this.compileCode(moduleWrapper.data.code)
        }
      }

      this.addVersion(version)
    }

    return version
  } catch (error) {
    console.error("Error in loadApp:", error)
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
    let version: Version

    // 处理平台模板
    if (templateId.startsWith("plat_template_")) {
      const result = await getPlatMetaData([templateId])
      if (!result.data?.[0]?.values[0]?.value) {
        throw new Error("Failed to load platform template")
      }

      const templateData = JSON.parse(result.data?.[0]?.values[0]?.value)
      const oldAppId = templateData.app.id

      // 创建新的 modules 对象
      const newModules = {}

      // 遍历并更新所有模块
      Object.entries(templateData.modules).forEach(([oldModuleId, moduleWrapper]) => {
        // 创建新的模块ID
        const newModuleId = oldModuleId.replace(oldAppId, appId)

        // 更新模块数据中的ID引用
        const updatedModuleData = {
          ...moduleWrapper.data,
          id: newModuleId,
          // 如果模块数据中有其他引用旧appId的地方，也需要更新
          code: moduleWrapper.data.code.replace(new RegExp(oldAppId, "g"), appId),
        }

        // 创建新的模块包装器
        newModules[newModuleId] = {
          ...moduleWrapper,
          data: updatedModuleData,
          updatedAt: new Date().toISOString(),
        }
      })

      // 更新app.modules中的引用
      const newAppModules = {}
      Object.entries(templateData.app.modules).forEach(([oldModuleId, moduleInfo]) => {
        const newModuleId = oldModuleId.replace(oldAppId, appId)
        newAppModules[newModuleId] = {
          ...moduleInfo,
          id: newModuleId,
        }
      })

      // 创建新版本
      version = {
        timestamp: Date.now(),
        app: {
          ...templateData.app,
          id: appId,
          name: name,
          version: Date.now(),
          updatedAt: new Date().toISOString(),
          modules: newAppModules, // 使用更新后的modules引用
        },
        modules: newModules, // 使用更新后的modules
      }
    }
    // 处理官方模板或空白模板
    else {
      let aiResponse
      if (templateId && templates[templateId]) {
        aiResponse = templates[templateId].code
      } else {
        aiResponse = initialAIResponse
      }

      const result = await this.generateInitialVersion(aiResponse, name)
      if (!result.success || !result.version) {
        throw new Error("Failed to create app")
      }
      version = result.version
    }

    // 添加版本并发布
    this.addVersion(version)
    await this.publishToServer({ useLatest: true })
    await this.updateAppIndex(version.app, name)
    return appId
  } catch (error) {
    console.error("Error creating app:", error)
    this.clear()
    throw error
  }
}
