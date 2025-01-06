import { AppCodeStore, Version } from "../types"

export function exportToMarkdown(this: AppCodeStore): string {
  if (!this.currentVersion) {
    throw new Error("No current version")
  }

  const version = this.currentVersion
  let markdown = "# 应用代码导出\n\n"
  const typeOrder = ["app", "page", "store", "service", "module"]

  const modulesByType = typeOrder.reduce(
    (acc, type) => {
      acc[type] = Object.entries(version.modules)
        .filter(([_, module]) => module.data.type === type)
        .sort(([idA], [idB]) => idA.localeCompare(idB))
      return acc
    },
    {} as Record<string, [string, any][]>
  )

  typeOrder.forEach((type) => {
    if (modulesByType[type].length > 0) {
      markdown += `\n## ${type.charAt(0).toUpperCase() + type.slice(1)} Modules\n\n`

      modulesByType[type].forEach(([moduleId, module]) => {
        const { data } = module
        markdown += "```jsx\n"

        let tagAttributes = `type="${type}"`
        if (type === "app") {
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
    }
  })

  return markdown
}

export function exportToMarkdownWithoutType(this: AppCodeStore): string {
  if (!this.currentVersion) {
    throw new Error("No current version")
  }

  const version = this.currentVersion
  let markdown = "# 应用代码导出\n\n"
  markdown += "## All Modules\n\n"

  const sortedModules = Object.entries(version.modules)
    .sort(([idA], [idB]) => idA.localeCompare(idB))

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

export function downloadMarkdown(this: AppCodeStore): void {
  try {
    const markdown = this.exportToMarkdown()
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${this.appId}_export_${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading markdown:", error)
    throw error
  }
}

export function downloadMarkdownWithoutType(this: AppCodeStore): void {
  try {
    const markdown = this.exportToMarkdownWithoutType()
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${this.appId}_export_all_${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading markdown:", error)
    throw error
  }
}