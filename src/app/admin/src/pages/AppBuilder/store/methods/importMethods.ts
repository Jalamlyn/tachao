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
