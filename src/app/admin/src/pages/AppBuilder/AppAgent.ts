import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunkFree from "@/service/chat/chat-chunk-openrouter-free"
import { AppBuilderMessage } from "./types"
import { balanceStore } from "@/stores/balanceStore"
import { appCodeStore } from "./store/appCodeStore"
import { promptsComposer } from "./prompts"
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

  private async getRelevantModuleIds(modules: Record<string, any>, command: string | CommandInput): Promise<string[]> {
    const commandContent = typeof command === "string" ? command : command.content
    const cleanContent = commandContent.trim().toLowerCase().startsWith("@pm")
      ? commandContent.replace("@pm", "").trim()
      : commandContent

    const commandImages = typeof command === "string" ? [] : command.images || []

    const modulesContext = Object.entries(modules)
      .map(
        ([id, module]) => `
模块ID: ${id}
模块名称: ${module.data.name}
模块标题: ${module.data.title}
模块类型: ${module.data.type}
模块代码:
${module.data.code}
`
      )
      .join("\n---\n")

    const prompt = `分析以下项目代码和用户输入，返回与用户输入最相关的模块ID列表。
项目代码：
${modulesContext}

用户输入：${cleanContent}

请先分析用户输入和各个模块的关系，将分析结果输出到 mo-ai-think 标签中，然后将相关模块ID以JSON格式返回到 <mo-ai-code> 标签中。JSON格式为：{"moduleIds": ["id1", "id2"]}。只返回确实相关的模块ID。`

    let response = ""
    await chatChunkFree(
      [
        {
          role: "user",
          content: prompt,
          images: commandImages,
        },
      ],
      (chunk: string) => {
        response += chunk
      },
      () => {},
      true,
      0
    )

    const match = response.match(/<mo-ai-code.*?>(.*?)<\/mo-ai-code>/s)
    if (!match) {
      return []
    }
    try {
      const json = JSON.parse(match[1])
      return json.moduleIds || []
    } catch (error) {
      console.error("Error parsing module IDs:", error)
      return []
    }
  }

  private getRelevantLogs(): { logs: string; completeness: any } {
    const MAX_LOGS = 10
    // 修改：获取最新的日志，使用 reverse=true 确保最新的日志在前面
    const allLogs = logStore.getLatestLogs(100, true)

    // 优先获取最新的错误和警告日志
    const errorAndWarnings = allLogs.filter((log) => log.level === "error" || log.level === "warn").slice(0, MAX_LOGS)

    // 如果错误和警告不足MAX_LOGS条，补充其他类型的最新日志
    const remainingCount = MAX_LOGS - errorAndWarnings.length
    const otherLogs = allLogs.filter((log) => log.level !== "error" && log.level !== "warn").slice(0, remainingCount)

    // 合并日志并保持最新的日志在前面
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
      const systemPrompt = await promptsComposer.getSystemPrompt()

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
          // const relevantIds = await this.getRelevantModuleIds(allModules, command)
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
模块代码:
${module.data.code}
`
        )
        .join("\n---\n")

      const { logs: relevantLogs, completeness } = this.getRelevantLogs()
      // 获取知识库内容
      const knowledgeContext = knowledgeStore.getKnowledgeContext()

      // 获取应用列表信息
      const appsContext = await this.getAppsContext()

      const enhancedCommand = `<我的输入>${commandContent}, 生成完整代码必须确保代码是完整的</我的输入><project>
            ${
              isPMMode
                ? `
            注意：这是一个产品经理咨询模式的对话，请不要生成任何代码，只需要：
            1. 仔细阅读项目代码
            2. 理解用户的问题,并给出回答。
            `
                : ""
            }
            
            1. 应用入口代码：
            ${appCodeStore.currentVersion?.modules[appEntryId]?.data?.code || "需要先创建应用入口代码，包含基础路由配置"}
            
            2. ${
              moduleSelectionMode === "manual"
                ? `手动选中的模块代码 (${Object.keys(relevantModules).length}个模块):`
                : moduleSelectionMode === "smart"
                  ? `AI智能选择的相关模块代码 (${Object.keys(relevantModules).length}个模块):`
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
            ${command.images.map((url, index) => `图片${index + 1}: ${url}`).join("\n            ")}
            `
                : ""
            }
            </project>
            
            ${
              isPMMode
                ? `
            请分析上述项目代码和系统日志，并回答用户的问题：
            <我的输入>${commandContent.replace("@pm", "").trim()}</我的输入>
            `
                : `
            <project> 里是现有代码和系统日志,根据 <我的输入> ,生成所有代码都必须包裹在\`\`\`jsx<mo-ai-code type="xxx" name="xxx" title="xxx" des="模块一句话介绍">生成的代码,必须确保代码是完整的, 不允许用注释省略模块中的任何代码和任何逻辑,禁止在代码中生成"""// ... 保留原有方法 ... {/* ... 保留 xxx ... */}, // 在现有的 xxx 中添加以下方法, // 其他现有方法保持不变..., //其他原有方法... """</mo-ai-code>\`\`\`标签中,你需要先进行一轮思考, 检查模块上下文是否足够, 如果模块上下文不充分, 向我要求提供更多的模块上下文, 然后列出要生成或者修改的模块名称, 然后再开始生成代码,所有列出的模块都必须生成, ui交互要从设计师的角度思考, 不要返回没有修改的模块
            `
            }
            <我的输入>${commandContent}</我的输入>`

      const allMessages = [
        { role: "system", content: systemPrompt },
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
        0
      )

      const version = await appCodeStore.handleAIGeneration(response)
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
