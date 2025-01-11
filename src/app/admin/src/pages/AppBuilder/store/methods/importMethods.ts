import { AppCodeStore, Version, DependencyCheckResult, DependencyCheckProgress } from "../types"

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

async function checkDependencies(
  moduleIds: string[],
  allModules: Record<string, any>,
  onProgress?: (progress: DependencyCheckProgress) => void
): Promise<DependencyCheckResult> {
  const result: DependencyCheckResult = {
    canDelete: true,
    dependencies: []
  }

  // 获取要删除的模块名称列表
  const modulesToDelete = moduleIds.map(id => {
    const module = allModules[id]
    return {
      id,
      name: module.data.name
    }
  })

  // 获取未被删除的模块列表
  const remainingModules = Object.entries(allModules)
    .filter(([id]) => !moduleIds.includes(id))

  const totalModules = remainingModules.length
  let checkedModules = 0

  // 检查每个要删除的模块
  for (const deleteModule of modulesToDelete) {
    const dependentModules = []

    // 在剩余模块中搜索依赖
    for (const [moduleId, module] of remainingModules) {
      checkedModules++
      
      // 更新进度
      onProgress?.({
        current: checkedModules,
        total: totalModules * modulesToDelete.length,
        currentModule: module.data.title || module.data.name,
        status: `检查模块依赖关系`
      })

      const code = module.data.code
      
      // 使用正则表达式匹配 wpm.import 语句
      const importRegex = new RegExp(`wpm\\.import\\(['"](${deleteModule.name})['"]\\)`, 'g')
      
      if (importRegex.test(code)) {
        dependentModules.push({
          moduleId,
          name: module.data.name,
          title: module.data.title || module.data.name
        })
      }
    }

    // 如果找到依赖，添加到结果中
    if (dependentModules.length > 0) {
      result.canDelete = false
      result.dependencies.push({
        moduleId: deleteModule.id,
        name: deleteModule.name,
        dependentModules
      })
    }
  }

  return result
}

export async function deleteModules(
  this: AppCodeStore,
  moduleIds: string[],
  onProgress?: (progress: DependencyCheckProgress) => void
): Promise<Version> {
  if (!this.currentVersion) {
    throw new Error("No current version")
  }

  try {
    // 执行依赖检查
    const dependencyCheck = await checkDependencies(
      moduleIds,
      this.currentVersion.modules,
      onProgress
    )

    // 如果存在依赖，抛出错误
    if (!dependencyCheck.canDelete) {
      const errorDetails = dependencyCheck.dependencies.map(dep => {
        const dependents = dep.dependentModules
          .map(d => `${d.title}`)
          .join(', ')
        return `模块 "${dep.name}" 被以下模块依赖: ${dependents}`
      }).join('\n')

      throw new Error(`无法删除模块，存在依赖关系：\n${errorDetails}`)
    }

    // 检查是否为应用入口模块
    if (moduleIds.includes(`${this.appId}_app_entry`)) {
      throw new Error("Cannot delete app entry module")
    }

    // 创建新的modules对象，排除要删除的模块
    const updatedModules = { ...this.currentVersion.modules }
    const updatedAppModules = { ...this.currentVersion.app.modules }

    moduleIds.forEach((moduleId) => {
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