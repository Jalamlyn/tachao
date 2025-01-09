import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunkFree from "@/service/chat/chat-chunk-openrouter-free"
import { AppBuilderMessage } from "./types"
import { balanceStore } from "@/stores/balanceStore"
import { appCodeStore } from "./store/appCodeStore"
import { promptsComposer } from "./prompts"
import { logStore } from "./AIEditor/components/LogStore"

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

  private async getRelevantModuleIds(modules: Record<string, any>, command: string | CommandInput): Promise<string[]> {
    const commandContent = typeof command === "string" ? command : command.content
    // 如果是 @pm 模式，移除 @pm 前缀再进行分析
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

  private getRelevantLogs(): string {
    const logs = logStore.logs
    const MAX_LOGS = 500 // 最大日志数量
    
    // 优先选择错误和警告日志
    const errorAndWarnings = logs.filter(log => 
      log.level === 'error' || log.level === 'warn'
    ).slice(-100) // 最多 100 条错误和警告
    
    // 然后是最新的普通日志
    const recentLogs = logs
      .filter(log => log.level !== 'error' && log.level !== 'warn')
      .slice(-(MAX_LOGS - errorAndWarnings.length))
    
    // 合并日志并格式化
    const allLogs = [...errorAndWarnings, ...recentLogs]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(log => `[${log.level.toUpperCase()}] ${log.message}${
        log.details ? `\nDetails: ${JSON.stringify(log.details)}` : ''
      }`)
      .join('\n')

    return allLogs
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

      // 获取所有可用模块
      const allModules = appCodeStore.currentVersion?.modules || {}

      // 根据不同的选择模式获取相关模块
      let relevantModules: Record<string, any> = {}
      let moduleSelectionMode = "all"

      if (appCodeStore.viewState.useSelectedModulesAsContext) {
        // 如果是手动选择模式，使用已选择的模块
        relevantModules = appCodeStore.getContextModules()
        moduleSelectionMode = "manual"
      } else {
        // 使用 getRelevantModuleIds 获取相关模块，包括 @pm 模式
        const relevantIds = await this.getRelevantModuleIds(allModules, command)
        if (relevantIds.length === 0) {
          // 如果没有找到相关模块，使用所有模块作为默认值
          relevantModules = allModules
          moduleSelectionMode = "all"
        } else {
          // 构建相关模块对象
          relevantModules = relevantIds.reduce((acc, id) => {
            if (allModules[id]) {
              acc[id] = allModules[id]
            }
            return acc
          }, {})
          moduleSelectionMode = "smart"
        }
      }

      // 确保应用入口模块总是包含在内
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

      // 获取相关日志
      const relevantLogs = this.getRelevantLogs()

      const enhancedCommand = `<project>
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

            3. 系统日志上下文（按重要性排序的最新日志）：
            ${relevantLogs}

            ${
              typeof command !== "string" && command.images?.length > 0
                ? `
            4. 用户上传的图片资源：
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
            <project> 里是现有代码和系统日志,根据 <我的输入> ,使用 SEARCH 和 REPLACE 模式来修改或创建模块,如果代码中用 wpm.import 了某个模块, 那必须同时生成这个模块,并 wpm.export, 不允许 wpm.import 还没有被 wpm.export 的模块, 生成所有代码都必须包裹在\`\`\`jsx<mo-ai-code type="xxx" name="xxx" title="xxx" des="模块一句话介绍">生成的代码</mo-ai-code>\`\`\`标签中,你需要先列出要生成或者修改的模块名称,然后再开始生成代码,所有列出的模块都必须生成, ui交互要从设计师的角度思考, <experience-nextui>里有示例代码, 不要返回没有修改的模块

            在生成的代码中，请使用日志 API 记录重要信息：
            1. 错误日志 (ERROR)：表示需要立即处理的严重问题
               context.api.log.error("操作失败", { error: error.message })
            
            2. 警告日志 (WARN)：表示潜在的问题或风险
               context.api.log.warn("API响应时间过长", { responseTime: "2000ms" })
            
            3. 信息日志 (INFO)：记录正常的系统操作
               context.api.log.info("用户提交表单", { formData: data })
            
            4. 调试日志 (DEBUG)：包含详细的技术信息
               context.api.log.debug("状态更新", { oldState, newState })

            <我的输入>${commandContent}</我的输入>禁止使用 " // ... 其他代码保持不变 ..." 这样的方式来修改代码, 对于大型文件可以使用 SEARCH/REPLACE 模式
            `
            }
            
            4. 仔细分析我的输入和系统日志,考虑以下方面:
              - 任务复杂性
              - 上下文信息审查
              - 执行计划制定
              - 修改执行
              - 修改总结
              使用以下格式呈现您的思考过程:
              <mo-ai-think>
              [您的思考过程,涉及上述提到的每个考虑因素]
              <mo-ai-context_check>
              [检查上下文信息是否完整,考虑是否缺少任何模块或上下文，
              检查要修改的模块是否在上下文中已经提供，如果没有提供，就停止并向用户要求添加要修改的模块]
              </mo-ai-context_check>
              <mo-ai-reflection>
              [反思您的初步想法,考虑它们是否合理,是否缺少任何模块或上下文,以及是否需要改进]
              </mo-ai-reflection>
              </mo-ai-think>
              <mo-ai-final_plan>
              [列出反思后的最终计划，${isPMMode ? "包括如何回答用户的问题" : "包括要修改哪些模块以及如何修改"}]
              </mo-ai-final_plan>`

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