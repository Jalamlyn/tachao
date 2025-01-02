// 保持原有的导入语句和类型定义...

class AppCodeStore {
  // 保持原有的属性定义...

  async executeModules(context: any) {
    if (!this.currentVersion) return []

    const results: Array<{
      success: boolean
      moduleId: string
      type: string
      name: string
      executionTime?: number
      error?: string
      result?: any
    }> = []

    const version = this.currentVersion

    try {
      // 1. 执行所有模块
      for (const [moduleId, moduleWrapper] of Object.entries(version.modules)) {
        const startTime = performance.now()

        try {
          const moduleData = moduleWrapper.data

          if (!moduleData || !moduleData.compiledCode) {
            throw new Error(`Invalid module data for ${moduleId}`)
          }

          // 改进的模块执行代码
          const moduleFunction = new Function(
            "context",
            `
            return async () => {
              try {
                ${moduleData.compiledCode.replace(/export default/, "return")}
              } catch (error) {
                console.error("Module execution error:", error);
                throw new Error(\`Module execution failed: \${error.message}\`);
              }
            }
            `
          )

          // 使用 Promise.catch 捕获异步错误
          await moduleFunction(context)().catch(error => {
            throw new Error(`Module ${moduleId} execution failed: ${error.message}`)
          })

          results.push({
            success: true,
            moduleId,
            type: moduleData.type,
            name: moduleData.name,
            executionTime: performance.now() - startTime,
          })
        } catch (error) {
          console.error(`Error executing module ${moduleId}:`, error)
          results.push({
            success: false,
            moduleId,
            type: moduleWrapper.data?.type || "unknown",
            name: moduleWrapper.data?.name || moduleId,
            executionTime: performance.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      return results
    } catch (error) {
      console.error("Error executing modules:", error)
      return [{
        success: false,
        moduleId: "unknown",
        type: "unknown",
        name: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
      }]
    }
  }

  // 保持其他方法不变...
}

export const appCodeStore = new AppCodeStore()