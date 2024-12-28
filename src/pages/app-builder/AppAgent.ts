import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunk from "@/service/chat/chat-deepseek"
import { AppBuilderMessage, AppPages } from "./types"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { balanceStore } from "@/stores/balanceStore"

class AppAgent {
  private static instance: AppAgent
  private _appCache: Map<string, {
    pages: AppPages
    appCode: string
    version: number
    updatedAt: string
  }> = new Map()

  private constructor() {}

  public static getInstance(): AppAgent {
    if (!AppAgent.instance) {
      AppAgent.instance = new AppAgent()
    }
    return AppAgent.instance
  }

  public getAppCache(appId: string) {
    return this._appCache.get(appId)
  }

  public setAppCache(
    appId: string,
    data: {
      pages: AppPages
      appCode: string
      version: number
      updatedAt: string
    }
  ) {
    this._appCache.set(appId, data)
    // 同步到 localStorage
    localStorage.setItem(`app_cache_${appId}`, JSON.stringify(data))
  }

  public async loadAppCache(appId: string) {
    // 先尝试从 localStorage 加载
    const cached = localStorage.getItem(`app_cache_${appId}`)
    if (cached) {
      this._appCache.set(appId, JSON.parse(cached))
      return
    }

    // 如果没有缓存，从服务器加载
    try {
      // 获取应用信息
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const app = apps.find((a: any) => a.id === appId)
      if (!app) throw new Error("App not found")

      // 获取所有页面的代码
      const pages: AppPages = {}
      for (const page of app.pages || []) {
        const pageResult = await getMetadata([page.id])
        if (pageResult.data?.[0]?.value) {
          const pageData = JSON.parse(pageResult.data[0].value)
          pages[page.id] = {
            code: pageData.code,
            title: pageData.title,
            updatedAt: pageData.updatedAt,
          }
        }
      }

      // 设置缓存
      this.setAppCache(appId, {
        pages,
        appCode: "",
        version: 1,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error loading app cache:", error)
      throw error
    }
  }

  public async processCommand(
    appId: string,
    messages: AppBuilderMessage[],
    command: string,
    onChunk?: (chunk: string) => void
  ): Promise<{
    success: boolean
    appCode?: string
    pages?: { [pageId: string]: string }
    error?: string
  }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    try {
      const appCache = this.getAppCache(appId)
      if (!appCache) {
        throw new Error("App cache not found")
      }

      const systemPrompt = `你是一个专业的前端开发专家，负责帮助用户开发和优化应用。
你需要理解用户的需求，生成符合要求的React组件代码。

当前应用的页面代码：
${JSON.stringify(appCache.pages, null, 2)}

代码生成规范：
1. 应用入口组件使用 <shata-ai-app-code></shata-ai-app-code> 包裹
2. 页面组件使用 <shata-ai-page-code pageid="xxx"></shata-ai-page-code> 包裹
3. 所有组件必须使用 NextUI 2.0 组件
4. 路由必须使用 ReactRouterDom
5. 动画使用 FramerMotion
6. 图标使用 @iconify/react 的 Icon 组件
7. 数据存储使用 getMetadata 和 setMetadata

注意事项：
1. 生成的代码必须完整，不能省略
2. 必须包含错误处理
3. 必须考虑性能优化
4. 必须遵循 React 最佳实践
5. 必须使用 JavaScript，不能使用 TypeScript`

      const enhancedCommand = `
${command}

请按照以下格式返回代码：
1. 如果需要修改某个页面：
<shata-ai-page-code pageid="页面ID">
页面代码
</shata-ai-page-code>

2. 如果需要修改应用入口：
<shata-ai-app-code>
入口组件代码
</shata-ai-app-code>
`

      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: enhancedCommand },
      ]

      let response = ""
      const model = sessionStorage.getItem("aiLevel") || "ADVANCED"

      if (model === "ADVANCED") {
        await chatChunk(
          allMessages,
          (chunk: string) => {
            response += chunk
            onChunk?.(chunk)
          },
          () => {},
          true,
          0
        )
      }

      if (model === "EXPERT") {
        await chatChunkExpert(
          allMessages,
          (chunk: string) => {
            response += chunk
            onChunk?.(chunk)
          },
          () => {},
          true,
          0
        )
      }

      // 解析响应
      const pageCodeMatches = response.match(/<shata-ai-page-code pageid="([^"]+)">([\s\S]*?)<\/shata-ai-page-code>/g)
      const appCodeMatch = response.match(/<shata-ai-app-code>([\s\S]*?)<\/shata-ai-app-code>/)

      const updatedPages: { [pageId: string]: string } = {}
      if (pageCodeMatches) {
        pageCodeMatches.forEach((match) => {
          const pageId = match.match(/pageid="([^"]+)"/)?.[1]
          const code = match.match(/<shata-ai-page-code[^>]*>([\s\S]*?)<\/shata-ai-page-code>/)?.[1]
          if (pageId && code) {
            updatedPages[pageId] = code.trim()
          }
        })
      }

      const appCode = appCodeMatch?.[1].trim()

      return {
        success: true,
        appCode,
        pages: updatedPages,
      }
    } catch (error) {
      console.error("Error in processCommand:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export default AppAgent.getInstance()