import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunk from "@/service/chat/chat-deepseek"
import { AppBuilderMessage, AppPages } from "./types"
import { getMetadata } from "@/service/apis/metadata"
import { balanceStore } from "@/stores/balanceStore"

class AppAgent {
  private static instance: AppAgent
  private _appCache: Map<
    string,
    {
      pages: AppPages
      appCode: string
      version: number
      updatedAt: string
    }
  > = new Map()

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

当前应用结构：

1. 应用入口代码：
${appCache.appCode ? appCache.appCode : "需要先创建应用入口代码，包含基础路由配置"}

2. 页面代码：
${Object.entries(appCache.pages)
  .map(
    ([pageId, page]) => `
页面ID: ${pageId}
标题: ${page.title}
代码:
${page.code}
`
  )
  .join("\n---\n")}

代码生成规范：

1. 代码生成顺序：
   - 如果应用入口代码不存在，必须先生成入口代码, 入口代码只负责路由的控制,不负责生成具体的 UI
   - 入口代码生成后，才能生成或修改页面代码
   - 每次修改都要确保路由配置与页面一致

2. 应用入口组件必须使用 <shata-ai-app-code></shata-ai-app-code> 包裹，且必须包含路由配置。
   注意：应用已经在 Router 环境中运行，不要生成任何形式的 Router 组件。

   正确示例：
    \`\`\`jsx
   <shata-ai-app-code>
   export default (props) => {
     const {React, NextUI, ReactRouterDom, PageWrapper} = context
     const {Routes, Route, Navigate, useNavigate, Link} = ReactRouterDom
     
     return (
       <div>
         <Routes>
           {/* 使用相对路径，不要以"/"开头 */}
           <Route path="" element={<Navigate to="home" replace />} />
           <Route path="home" element={<PageWrapper pageId="page_xxx" />} />
           <Route path="about" element={<PageWrapper pageId="page_yyy" />} />
           <Route path="*" element={<div>页面不存在</div>} />
         </Routes>
       </div>
     )
   }
   </shata-ai-app-code>
   \`\`\`

3. 页面组件使用 <shata-ai-page-code pageid="xxx"></shata-ai-page-code> 包裹：
   \`\`\`jsx
   <shata-ai-page-code pageid="page_xxx">
   export default (props) => {
     const {React, NextUI} = context
     return (
       <div>页面内容</div>
     )
   }
   </shata-ai-page-code>
   \`\`\`

4. 技术要求：
   - 所有组件必须使用 NextUI 2.0 组件
   - 直接使用 Routes 和 Route 进行路由配置
   - 使用 useNavigate 和 Link 进行导航
   - 动画使用 FramerMotion
   - 图标使用 @iconify/react 的 Icon 组件
   - 数据存储使用 getMetadata 和 setMetadata
   - 页面必须使用 PageWrapper 组件包装

5. 路由规范：
   - 使用相对路径（不要以"/"开头）
   - 必须包含默认路由重定向
   - 每个页面都必须配置路由
   - 必须处理 404 路由
   - 路由路径必须使用小写字母
   - 路由参数使用 kebab-case 命名

6. 页面导航：
   - 使用 useNavigate 进行编程式导航
   - 使用 Link 组件进行声明式导航
   - 支持路由参数传递
   - 处理导航状态和加载

7. 环境说明：
   - 应用运行在已有的 Router 环境中
   - 不需要也不允许创建新的 Router 上下文
   - Routes 组件已配置了正确的 basename
   - 所有路由路径都是相对于应用根路径的
   - 路由路径始终使用相对路径（不要以"/"开头）
   - 系统会自动处理基础路径的拼接
   - Link 和 useNavigate 会自动添加基础路径
   - 不需要手动处理基础路径，只需使用相对路径
   - 这是应用的实际运行环境，与开发环境完全分开

8. 路由路径示例：
   配置的路径    =>    实际访问路径
   ""           =>    /apps/{appId}/
   "home"       =>    /apps/{appId}/home
   "about"      =>    /apps/{appId}/about
   "users/list" =>    /apps/{appId}/users/list

注意事项：
1. 生成的代码必须完整，不能省略
2. 必须包含错误处理
3. 必须考虑性能优化
4. 必须遵循 React 最佳实践
5. 必须使用 JavaScript，不能使用 TypeScript
6. 严禁使用任何形式的 Router 组件
7. 必须先有应用入口代码才能生成页面代码
8. 路由路径使用相对路径，不要以"/"开头`

      const enhancedCommand = `
${command}

请按照以下格式返回代码：
1. 如果需要创建或修改应用入口：
<shata-ai-app-code>
入口组件代码
</shata-ai-app-code>

2. 如果需要修改某个页面（仅在应用入口存在时）：
<shata-ai-page-code pageid="页面ID">
页面代码
</shata-ai-page-code>
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
