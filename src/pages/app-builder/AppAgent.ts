import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunk from "@/service/chat/chat-deepseek"
import { AppBuilderMessage, AppPages } from "./types"
import { getMetadata } from "@/service/apis/metadata"
import { balanceStore } from "@/stores/balanceStore"

// 添加提示词模块
const promptModules = {
  thoughtChain: `作为一个专业的需求分析专家，请按照以下步骤分析用户需求：

1. 需求理解
   - 仔细阅读用户的需求描述
   - 识别关键词和核心诉求
   - 提取功能性和非功能性需求

2. 上下文分析
   - 考虑当前应用的状态和结构
   - 评估需求与现有功能的关系
   - 识别潜在的依赖和约束

3. 可行性评估
   - 技术可行性
   - 时间可行性
   - 资源需求

4. 实现建议
   - 推荐的实现方案
   - 可能的替代方案
   - 优先级建议

请将分析结果输出在 <shata-ai-think> 标签中。`,

  reflection: `现在请对之前的分析进行反思和评估：

1. 完整性检查
   - 是否遗漏了重要的需求点？
   - 是否考虑了所有相关因素？

2. 合理性评估
   - 分析是否符合逻辑？
   - 建议是否切实可行？

3. 风险评估
   - 是否存在潜在风险？
   - 是否需要额外的预防措施？

4. 改进建议
   - 需要补充的方面
   - 可以优化的部分

请将反思结果输出在 <shata-ai-reflection> 标签中。`,
}

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

${promptModules.thoughtChain}

${promptModules.reflection}

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
   - 如果应用入口代码不存在，必须先生成入口代码
   - 入口代码生成后，才能生成或修改页面代码
   - 每次修改都要确保路由配置与页面一致

2. 路由系统说明：
   现在支持完整的 React Router 路由系统
   - 使用 Routes 和 Route 组件进行路由配置
   - 实现路由嵌套和布局

3. 应用入口组件示例：

方式一（推荐）：使用 Routes 和 Route
\`\`\`jsx
<shata-ai-code type="app">
export default (props) => {
  const {React, NextUI, ReactRouterDom} = context
  const {Routes, Route, Navigate, BrowserRouter} = ReactRouterDom
  
  return (
    <BrowserRouter basename={props.basename}>
      <Routes>
        <Route path="/" element={<Navigate to="home" replace />} />
        <Route path="/home" element={<PageWrapper pageId="page_xxx" />} />
        <Route path="/about" element={<PageWrapper pageId="page_yyy" />}>
          <Route path="/team" element={<TeamPage />} />
        </Route>
        <Route path="*" element={<div>页面不存在</div>} />
      </Routes>
    </BrowserRouter>
  )
}
</shata-ai-code>
\`\`\`

4. 页面组件使用 <shata-ai-code type="page" pageid="xxx" title="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="page" pageid="page_xxx" title="页面标题">
export default (props) => {
  const {React, NextUI} = context
  return (
    <div>页面内容</div>
  )
}
</shata-ai-code>
\`\`\`

5. 技术要求：
   - 只能使用 NextUI 2.6.0 版本中实际存在的组件
   - 禁止使用 Container Grid Text 这些 NextUI V1 版本中的组件
   - 使用 tailwind css 编写样式代码
   - 动画使用 FramerMotion
   - 图标使用 @iconify/react 的 Icon 组件
   - 数据存储使用 getMetadata 和 setMetadata

6. 路由规范：
   - 使用相对路径（不要以"/"开头）
   - 必须包含默认路由重定向
   - 每个页面都必须配置路由
   - 必须处理 404 路由
   - 路由路径必须使用小写字母
   - 路由参数使用 kebab-case 命名

7. 页面导航：
   - 使用 useNavigate 进行编程式导航
   - 使用 Link 组件进行声明式导航
   - 支持路由参数传递
   - 处理导航状态和加载

8. 环境说明：
   - 应用运行在预览环境中
   - 基础路径为 /app-preview/{appId}
   - 所有路由路径都是相对于应用根路径的
   - 路由路径始终使用相对路径（不要以"/"开头）
   - 系统会自动处理基础路径的拼接

9. 路由路径示例：
   配置的路径    =>    实际访问路径
   ""           =>    /app-preview/{appId}/
   "home"       =>    /app-preview/{appId}/home
   "about"      =>    /app-preview/{appId}/about
   "users/list" =>    /app-preview/{appId}/users/list

注意事项：
1. 生成的代码必须完整，不能省略
2. 必须包含错误处理
3. 必须考虑性能优化
4. 必须遵循 React 最佳实践
5. 必须使用 JavaScript，不能使用 TypeScript
6. 必须先有应用入口代码才能生成页面代码`

      const enhancedCommand = `
${command},从设计师的角度

请按照以下步骤处理：

1. 首先，分析用户需求并输出在 <shata-ai-think> 标签中
2. 对分析结果进行反思，输出在 <shata-ai-reflection> 标签中
3. 最后，按照以下格式返回代码：

1. 如果需要创建或修改应用入口：
---
我开始编写应用入口组件的代码:
\`\`\`jsx
<shata-ai-code type="app">
入口组件代码,必须是完整代码, 不能省略任何逻辑和代码
</shata-ai-code>
\`\`\`
---
2. 如果需要修改一个或者多个页面（仅在应用入口存在时）：
---
我开始编写 xxx页面的代码:
\`\`\`jsx
<shata-ai-code type="page" pageid="页面ID" title="页面标题">
页面代码,必须是完整代码, 不能省略任何逻辑和代码
</shata-ai-code>
\`\`\`
---
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
      const pageCodeMatches = response.match(
        /<shata-ai-code type="page" pageid="([^"]+)" title="([^"]+)">([\s\S]*?)<\/shata-ai-code>/g
      )
      const appCodeMatch = response.match(/<shata-ai-code type="app">([\s\S]*?)<\/shata-ai-code>/)

      const updatedPages: { [pageId: string]: string } = {}
      if (pageCodeMatches) {
        pageCodeMatches.forEach((match) => {
          const pageId = match.match(/pageid="([^"]+)"/)?.[1]
          const title = match.match(/title="([^"]+)"/)?.[1]
          const code = match.match(/<shata-ai-code[^>]*>([\s\S]*?)<\/shata-ai-code>/)?.[1]
          if (pageId && code && title) {
            updatedPages[pageId] = {
              code: code.trim(),
              title: title,
              updatedAt: new Date().toISOString(),
            }
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