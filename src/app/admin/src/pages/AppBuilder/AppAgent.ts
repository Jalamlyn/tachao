import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
// import chatChunkExpert from "@/service/chat/chat-deepseek"
import { AppBuilderMessage } from "./types"
import { balanceStore } from "@/stores/balanceStore"
import { appCodeStore } from "./store/appCodeStore"
import { imageStore } from "./AIEditor/components/ImageStore"
import { promptsComposer } from "./prompts"

class AppAgent {
  private static instance: AppAgent

  private constructor() {}

  public static getInstance(): AppAgent {
    if (!AppAgent.instance) {
      AppAgent.instance = new AppAgent()
    }
    return AppAgent.instance
  }

  public async processCommand(
    appId: string,
    messages: AppBuilderMessage[],
    command: string,
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
      const enhancedCommand = `<project>
      
1. 应用入口代码：
${appCodeStore.currentVersion?.modules[`${appId}_app_entry`]?.data?.code || "需要先创建应用入口代码，包含基础路由配置"}

2. 所有模块代码：
${
  appCodeStore.currentVersion?.modules
    ? Object.entries(appCodeStore.currentVersion.modules)
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
    : ""
}
</project>, <project> 里是现有代码,根据 <我的输入> 进行修改, 你修改现有代码的时候必须每次都返回修改后的完整代码, 不允许有省略和注释任何一行代码, 如果代码中用 wpm.import 了某个模块, 那必须同时生成这个模块,并 wpm.export, 不允许 wpm.import 还没有被 wpm.export 的模块, 生成所有代码都必须包裹在\`\`\`jsx<mo-ai-code type="xxx">生成的代码</mo-ai-code>\`\`\`标签中,你需要先列出要生成或者修改的模块名称,然后再开始生成代码,所有列出的模块都必须生成, ui交互要从设计师的角度思考, <experience-nextui>里有示例代码, 不要返回没有修改的模块
<我的输入>${command}</我的输入>,在响应的我的输入之前, 对我的输入进行思考, 并将思考过程写在<mo-ai-think>你的思考内容</mo-ai-think>,思考完成后根据我的输入的复杂性决定是否需要反思, 如果需要反思,就将反思的内容写在<mo-ai-rethink>你的反思内容</mo-ai-rethink>,响应结束后要给出总结, 并主动询问我后续的工作`
      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        {
          role: "user",
          content: enhancedCommand,
          images: imageStore.images ? imageStore.images : [],
        },
      ]

      let response = ""

      // 始终使用专家模型
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

      // 使用appCodeStore处理AI响应
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
