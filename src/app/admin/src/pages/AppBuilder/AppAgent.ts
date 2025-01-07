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
</project>, <project> 里是现有代码,根据 <我的输入> 进行修改, 你修改现有代码的时候必须每次都返回修改后的完整代码, 不允许有省略和注释任何一行代码, 如果代码中用 wpm.import 了某个模块, 那必须同时生成这个模块,并 wpm.export, 不允许 wpm.import 还没有被 wpm.export 的模块, 生成所有代码都必须包裹在\`\`\`jsx<mo-ai-code type="xxx" name="xxx" title="xxx" des="模块一句话介绍">生成的代码</mo-ai-code>\`\`\`标签中,你需要先列出要生成或者修改的模块名称,然后再开始生成代码,所有列出的模块都必须生成, ui交互要从设计师的角度思考, <experience-nextui>里有示例代码, 不要返回没有修改的模块
<我的输入>${commandContent},生成的代码要完整, 不要省略</我的输入>,4. 
  仔细分析我的输入,考虑以下方面:
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
  [列出反思后的最终计划,包括要修改哪些模块以及如何修改]
  </mo-ai-final_plan>`

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
