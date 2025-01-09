import { AppCodeStore, Version } from "../types"

export function exportToMarkdown(this: AppCodeStore, moduleIds?: string[]): string {
  if (!this.currentVersion) {
    throw new Error("No current version")
  }

  const version = this.currentVersion
  let markdown = "# 应用代码导出\n\n"
  markdown += "## All Modules\n\n"

  // 如果提供了 moduleIds,只导出选中的模块
  const modulesToExport = moduleIds
    ? Object.entries(version.modules).filter(([id]) => moduleIds.includes(id))
    : Object.entries(version.modules)

  const sortedModules = modulesToExport.sort(([idA], [idB]) => idA.localeCompare(idB))

  sortedModules.forEach(([moduleId, module]) => {
    const { data } = module
    markdown += "```jsx\n"

    let tagAttributes = `type="${data.type}"`
    if (data.type === "app") {
      // app类型不需要额外属性
    } else {
      tagAttributes += ` name="${data.name}"`
      if (data.title) {
        tagAttributes += ` title="${data.title}"`
      }
    }

    markdown += `<mo-ai-code ${tagAttributes}>\n`
    markdown += `${data.code}\n`
    markdown += "</mo-ai-code>\n```\n\n"
  })

  return markdown
}

export function downloadMarkdown(this: AppCodeStore, moduleIds?: string[]): void {
  try {
    const markdown = this.exportToMarkdown(moduleIds)
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const suffix = moduleIds ? "_selected" : "_all"
    a.download = `${this.appId}_export${suffix}_${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading markdown:", error)
    throw error
  }
}
