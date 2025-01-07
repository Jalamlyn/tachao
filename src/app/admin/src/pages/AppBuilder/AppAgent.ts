import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunkFree from "@/service/chat/chat-chunk-openrouter-free"
import { AppBuilderMessage } from "./types"
import { balanceStore } from "@/stores/balanceStore"
import { appCodeStore } from "./store/appCodeStore"
import { promptsComposer } from "./prompts"

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

用户输入：${commandContent}

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

    // 从响应中提取JSON
    const match = response.match(/```jsx<mo-ai-code.*?>(.*?)<\/mo-ai-code>```/s)
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

  public async processCommand(
    appId: string,
    messages: AppBuilderMessage[],
    command: string | CommandInput,
    onChunk?: (chunk: string) => void
  ): Promise<{
    success: boolean
    version?: any
    error?: string
  }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    try {
      // 设置当前appId
      appCodeStore.setAppId(appId)
      const systemPrompt = await promptsComposer.getSystemPrompt()

      // 处理 command 参数
      let commandContent: string
      let commandImages: string[] = []

      if (typeof command === "string") {
        commandContent = command
      } else {
        commandContent = command.content
        commandImages = command.images || []
      }

      // 检查是否是与产品经理对话
      if (commandContent.toLowerCase().includes("@pm")) {
        throw new Error("请使用代码搜索助手与产品经理对话")
      }

      // 获取相关模块ID
      const relevantModuleIds = await this.getRelevantModuleIds(appCodeStore.currentVersion?.modules || {}, command)
      
      // 构建优化后的上下文
      const relevantModules = relevantModuleIds.length
        ? Object.entries(appCodeStore.currentVersion?.modules || {})
            .filter(([id]) => relevantModuleIds.includes(id))
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
        : Object.entries(appCodeStore.currentVersion?.modules || {})
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

      const enhancedCommand = `<project>
      
1. 应用入口代码：
${appCodeStore.currentVersion?.modules[`${appId}_app_entry`]?.data?.code || "需要先创建应用入口代码，包含基础路由配置"}

2. 所有模块代码：
${relevantModules}
</project>

我是高级工程师Mo，专注于代码实现和功能开发。请告诉我你的需求，我会帮你实现：

<我的输入>${commandContent}</我的输入>

让我仔细分析你的需求：
1. 任务复杂性评估
2. 代码实现方案设计
3. 性能和可维护性考虑
4. 代码生成和优化

我会生成完整的代码实现，确保：
- 代码质量：遵循最佳实践
- 性能优化：高效的实现方式
- 可维护性：清晰的结构和注释
- 兼容性：与现有代码无缝集成

所有生成的代码都会包含在 \`\`\`jsx<mo-ai-code type="xxx" name="xxx" title="xxx" des="xxx">...\`\`\` 标签中。`

      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        {
          role: "user",
          content: enhancedCommand,
          images: commandImages,
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
        success: true,
        version,
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