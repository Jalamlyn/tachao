import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import { AppBuilderMessage } from "./types"
import { balanceStore } from "@/stores/balanceStore"
import { appCodeStore } from "./store/appCodeStore"
import { logStore } from "./AIEditor/components/LogStore"
import { knowledgeStore } from "./AIEditor/components/KnowledgeStore"
import { getMetadata } from "@/service/apis/metadata"
import { AppIndex } from "../AppManagement/store/types"

interface CommandInput {
  content: string
  images?: string[]
}

class AppAgent {
  private static instance: AppAgent

  private constructor() {}

  public static getInstance(): AppAgent {
    if (!AppAgent.instance) {
      AppAgent.instance = new AppAgent()
    }
    return AppAgent.instance
  }

  private async getAppsContext(): Promise<string> {
    try {
      const result = await getMetadata(["app_index"])
      if (!result.data?.[0]?.value) {
        return "暂无应用信息"
      }

      const apps = JSON.parse(result.data[0].value) as AppIndex[]
      const appsContext = apps
        .map(
          (app) => `
应用ID: ${app.id}
应用名称: ${app.title}${app.creator ? `\n创建者: ${app.creator.name}` : ""}`
        )
        .join("\n---\n")

      return appsContext
    } catch (error) {
      console.error("Error getting apps context:", error)
      return "获取应用信息失败"
    }
  }

  private getRelevantLogs(): { logs: string; completeness: any } {
    const MAX_LOGS = 10
    const allLogs = logStore.getLatestLogs(100, true)
    const errorAndWarnings = allLogs.filter((log) => log.level === "error" || log.level === "warn").slice(0, MAX_LOGS)
    const remainingCount = MAX_LOGS - errorAndWarnings.length
    const otherLogs = allLogs.filter((log) => log.level !== "error" && log.level !== "warn").slice(0, remainingCount)
    const relevantLogs = [...errorAndWarnings, ...otherLogs].sort((a, b) => b.timestamp - a.timestamp)
    const completeness = logStore.checkLogsCompleteness(relevantLogs)
    const logsText = relevantLogs
      .map(
        (log) =>
          `[${log.level.toUpperCase()}] ${log.message}${log.details ? `\nDetails: ${JSON.stringify(log.details)}` : ""}`
      )
      .join("\n")

    return {
      logs: logsText,
      completeness,
    }
  }

  public async processCommand(
    appId: string,
    messages: AppBuilderMessage[],
    command: string | CommandInput,
    onChunk?: (chunk: string) => void
  ): Promise<{
    success: boolean
    content?: string
    version?: any
    error?: string
  }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    try {
      const commandContent = typeof command === "string" ? command : command.content
      const isPMMode = commandContent.trim().toLowerCase().startsWith("@pm")

      appCodeStore.setAppId(appId)

      // 获取资料数据
      const result = await getMetadata(["resource_index"])
      const resources = JSON.parse(result.data?.[0]?.value || "[]")

      const allModules = appCodeStore.currentVersion?.modules || {}

      let relevantModules: Record<string, any> = {}
      let moduleSelectionMode = "all"

      if (appCodeStore.viewState.useSelectedModulesAsContext) {
        relevantModules = appCodeStore.getContextModules()
        moduleSelectionMode = "manual"
      } else {
        const moduleCount = Object.keys(allModules).length
        if (moduleCount <= 20) {
          relevantModules = allModules
          moduleSelectionMode = "all"
        } else {
          const relevantIds = []
          if (relevantIds.length === 0) {
            relevantModules = allModules
            moduleSelectionMode = "all"
          } else {
            relevantModules = relevantIds.reduce((acc, id) => {
              if (allModules[id]) {
                acc[id] = allModules[id]
              }
              return acc
            }, {})
            moduleSelectionMode = "smart"
          }
        }
      }

      const appEntryId = `${appId}_app_entry`
      if (allModules[appEntryId] && !relevantModules[appEntryId]) {
        relevantModules[appEntryId] = allModules[appEntryId]
      }

      const modulesContext = Object.entries(relevantModules)
        .map(
          ([id, module]) => `
模块ID: ${id}
模块名称: ${module.data.name}
模块标题: ${module.data.title}
模块类型: ${module.data.type}
模块路径: ${module.data.path}
模块代码:
${module.data.code}
`
        )
        .join("\n---\n")

      const { logs: relevantLogs, completeness } = this.getRelevantLogs()
      const knowledgeContext = knowledgeStore.getKnowledgeContext()
      const appsContext = await this.getAppsContext()

      // 构建项目上下文数据
      const projectContext = `
1. 应用入口代码：
${appCodeStore.currentVersion?.modules[appEntryId]?.data?.code || "需要先创建应用入口代码，包含基础路由配置"}

2. ${
        moduleSelectionMode === "manual"
          ? `手动选中的模块代码 (${Object.keys(relevantModules).length}个模块):`
          : `所有模块代码 (${Object.keys(relevantModules).length}个模块):`
      }
${modulesContext}

3. 系统日志上下文（注意：这只是最近的部分日志，按重要性排序）：
${relevantLogs}

${
  !completeness.isComplete
    ? `
注意：当前日志可能不完整：
${completeness.summary}

如果这些日志不足以分析问题，请：
1. 说明需要查看更多日志
2. 具体说明需要哪些类型的日志（例如：特定时间段、特定级别、或包含特定关键词的日志）
3. 建议用户使用日志查看器的过滤功能，找到并提供相关日志
`
    : ""
}

4. 知识库内容：
${knowledgeContext || "暂无自定义知识内容"}

5. 系统中的应用列表：
${appsContext}

${
  typeof command !== "string" && command.images?.length > 0
    ? `
6. 用户上传的图片资源：
${command.images.map((url, index) => `图片${index + 1}: ${url}`).join("\n")}`
    : ""
}`

      // 构建完整的用户输入
      const enhancedCommand = isPMMode
        ? `${commandContent}
            [注意：这是一个产品经理咨询模式的对话，请不要生成任何代码，只需要：
              - 仔细阅读项目代码
              - 进行思考，将思考输出在 <mo-ai-think>你的思考过程</mo-ai-think>
              - 注意要引导用户按照逐步迭代的方式来实现需求，不要设计过于复杂的产品
              - 按照 MVP 原则，优先实现最小可行产品（MVP），然后再逐步迭代完善
              - 理解我的问题,并给出回答。
              - 我不懂技术，也看不懂代码
              - 这里的内容对用户不可见
              ]`
        : `${commandContent}
            [注意：这是一个工程师模式对话，
              - 仔细阅读项目代码
              - 进行思考，将思考输出在 <mo-ai-think>你的思考过程</mo-ai-think>
              - 这里的内容对用户不可见
              - 生成的代码不管有多长，都必须完整返回，禁止使用注释省略任何代码和逻辑
              - 注意要引导用户按照逐步迭代的方式来完成开发，不要一次开发一个很复杂的功能
              - 按照 MVP 原则，优先实现最小可行产品（MVP），然后再逐步迭代完善
              - 要有数据驱动的思路，先从数据模型再到 UI 视图
              - 开发完功能要告诉用户如何通过界面操作进行测试，使用现有组件进行测试，不要让用户集成新的组件，用户不懂技术也看不懂代码
              - 使用 typescript 开发
              - 禁止直接使用 getMetadata 和 setMetadata，必须通过 service 封装成数据模型的方式来操作数据
              ]
        `

      const allMessages = [
        ...messages,
        {
          role: "user",
          content: enhancedCommand,
          images: typeof command === "string" ? [] : command.images,
        },
      ]

      let response = ""

      await chatChunkExpert(
        allMessages,
        (chunk: string) => {
          response += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0,
        "YES",
        {
          resources,
          projectContext, // 将项目上下文数据传递给后端
        }
      )

      const version = await appCodeStore.handleAIGeneration(response)
      if (version.isNoCode) {
        return {
          isPMMode: true,
        }
      }
      return {
        ...version,
        isPMMode,
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
