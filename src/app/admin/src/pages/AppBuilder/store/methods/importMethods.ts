import { AppCodeStore } from "../types"

export async function importFromMarkdown(this: AppCodeStore, markdownContent: string) {
  try {
    // 清除现有状态
    this.clear()
    // 使用现有的AI响应处理逻辑
    const result = await this.handleAIGeneration(markdownContent)

    if (!result.success) {
      throw new Error("Failed to process imported code: " + (result.errors || []).join(", "))
    }

    // 添加为新的第一个版本
    if (result.version) {
      this.addVersion(result.version)
    }

    return result
  } catch (error) {
    console.error("Error importing from markdown:", error)
    throw error
  }
}

export async function deleteModules(moduleIds: string[]): Promise<Version> {
  if (!this.currentVersion) {
    throw new Error("No current version")
  }

  try {
    // 创建新的modules对象,排除要删除的模块
    const updatedModules = { ...this.currentVersion.modules }
    const updatedAppModules = { ...this.currentVersion.app.modules }

    moduleIds.forEach((moduleId) => {
      // 检查是否为应用入口模块
      if (moduleId === `${this.appId}_app_entry`) {
        throw new Error("Cannot delete app entry module")
      }
      delete updatedModules[moduleId]
      delete updatedAppModules[moduleId]
    })

    // 创建新版本
    const newVersion: Version = {
      timestamp: Date.now(),
      app: {
        ...this.currentVersion.app,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
        modules: updatedAppModules,
      },
      modules: updatedModules,
    }

    this.addVersion(newVersion)
    return newVersion
  } catch (error) {
    console.error("Error deleting modules:", error)
    throw error
  }
}
