import { makeAutoObservable } from "mobx"
import { transform } from "@/utils/moduleLoader"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { templates } from "../../../prompts/templates"
import wpm from "@wpm-js/core"

// 类型定义
export interface App {
  id: string
  name: string
  version: number
  updatedAt: string
  modules: {
    [moduleId: string]: ModuleIndex
  }
}

export interface ModuleIndex {
  id: string // ${appId}_${type}_${name}
  type: string // app/page/store/service/module/schema
  name: string // 模块名称
  title?: string // 显示标题
}

export interface ModuleData {
  id: string // 与索引ID一致
  type: string // 模块类型
  name: string // 模块名称
  title?: string // 显示标题
  code: string // 原始代码
  compiledCode: string // 编译后代码
}

interface Version {
  timestamp: number
  app: App
  modules: {
    [moduleId: string]: {
      metadata: string // 原始元数据
      data: ModuleData // 解析后的数据
      updatedAt: string
    }
  }
}

// 代码提取相关的接口定义
interface ShataAICode {
  type: "app" | "page" | "store" | "service" | "module" | "schema"
  code: string
  name?: string
  title?: string
  pageid?: string // 用于page类型
}

interface AppIndexItem {
  id: string
  title: string
  status: "active" | "draft"
  createdAt: string
  updatedAt: string
  version?: number
  lastPublishedAt?: string
}

class AppCodeStore {
  // 基础状态
  private appId: string | null = null
  private versions: Version[] = []
  private currentIndex: number = -1
  private readonly STORAGE_KEY = "appCode"

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  // ... (保持原有的所有方法不变)

  // 新增导出到Markdown的方法
  exportToMarkdown(): string {
    if (!this.currentVersion) {
      throw new Error("No current version")
    }

    const version = this.currentVersion
    let markdown = "# 应用代码导出\n\n"

    // 模块类型顺序
    const typeOrder = ["app", "page", "store", "service", "module", "schema"]
    
    // 按类型分组模块
    const modulesByType = typeOrder.reduce((acc, type) => {
      acc[type] = Object.entries(version.modules)
        .filter(([_, module]) => module.data.type === type)
        .sort(([idA], [idB]) => idA.localeCompare(idB))
      return acc
    }, {} as Record<string, [string, any][]>)

    // 生成markdown内容
    typeOrder.forEach(type => {
      if (modulesByType[type].length > 0) {
        markdown += `\n## ${type.charAt(0).toUpperCase() + type.slice(1)} Modules\n\n`
        
        modulesByType[type].forEach(([moduleId, module]) => {
          const { data } = module
          markdown += "```jsx\n"
          
          // 根据不同类型生成不同的标签属性
          let tagAttributes = `type="${type}"`
          if (type === "app") {
            // app类型不需要额外属性
          } else if (type === "page") {
            tagAttributes += ` pageid="${data.name}" title="${data.title || data.name}"`
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

  // 导出并下载Markdown文件
  downloadMarkdown(): void {
    try {
      const markdown = this.exportToMarkdown()
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `app_${this.appId}_export_${new Date().toISOString().slice(0,10)}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading markdown:', error)
      throw error
    }
  }

  // ... (保持原有的所有其他方法不变)
}

export const appCodeStore = new AppCodeStore()