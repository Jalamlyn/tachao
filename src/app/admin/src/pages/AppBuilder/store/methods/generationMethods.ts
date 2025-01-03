import { getMetadata } from "@/service/apis/metadata"
import { initialAIResponse } from "../../prompts/initTemplate"
// import initialAIResponse from "../../prompts/nextui/nextui_table_with_filters"
// import initialAIResponse from "../../prompts/nextui/nextui_expense_tracker"
import { AppCodeStore, Version, AIGenerationResult } from "../types"

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

export async function createApp(this: AppCodeStore, name: string): Promise<string> {
  const appId = this.generateId()
  this.setAppId(appId)

  try {
    const result = await this.handleAIGeneration(initialAIResponse, name)
    if (!result.success || !result.version) {
      throw new Error("Failed to create app")
    }

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
