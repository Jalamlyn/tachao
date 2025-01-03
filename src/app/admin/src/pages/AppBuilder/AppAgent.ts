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

      const systemPrompt = promptsComposer.getSystemPrompt()

      const enhancedCommand = `<project>
      
1. 应用入口代码：
${appCodeStore.currentVersion?.modules[`${appId}_app_entry`]?.data?.code || "需要先创建应用入口代码，包含基础路由配置"}

2. 页面代码：
${
  appCodeStore.currentVersion?.modules
    ? Object.entries(appCodeStore.currentVersion.modules)
        .filter(([_, module]) => module.data.type === "page")
        .map(
          ([id, module]) => `
页面ID: ${id}
标题: ${module.data.title || module.data.name}
代码:
${module.data.code}
`
        )
        .join("\n---\n")
    : ""
}

3. Store 代码：
${
  appCodeStore.currentVersion?.modules
    ? Object.entries(appCodeStore.currentVersion.modules)
        .filter(([_, module]) => module.data.type === "store")
        .map(
          ([id, module]) => `
Store名称: ${module.data.name}
代码:
${module.data.code}
`
        )
        .join("\n---\n")
    : ""
}

4. Service 代码：
${
  appCodeStore.currentVersion?.modules
    ? Object.entries(appCodeStore.currentVersion.modules)
        .filter(([_, module]) => module.data.type === "service")
        .map(
          ([id, module]) => `
Service名称: ${module.data.name}
代码:
${module.data.code}
`
        )
        .join("\n---\n")
    : ""
}

5. Module 代码：
${
  appCodeStore.currentVersion?.modules
    ? Object.entries(appCodeStore.currentVersion.modules)
        .filter(([_, module]) => module.data.type === "module")
        .map(
          ([id, module]) => `
Module名称: ${module.data.name}
代码:
${module.data.code}
`
        )
        .join("\n---\n")
    : ""
}

6. Schema 定义：
${
  appCodeStore.currentVersion?.modules
    ? Object.entries(appCodeStore.currentVersion.modules)
        .filter(([_, module]) => module.data.type === "schema")
        .map(
          ([id, module]) => `
Schema名称: ${module.data.name}
定义:
${module.data.code}
`
        )
        .join("\n---\n")
    : ""
}
</project>, <project> 里是现有代码, 你修改现有代码的时候必须每次都返回修改后的完整代码, 不允许有省略和注释任何一行代码, 如果代码中用 wpm.import 了某个模块, 那必须同时生成这个模块,并 wpm.export, 不允许 wpm.import 还没有被 wpm.export 的模块, 生成所有代码都必须包裹在\`\`\`jsx<mo-ai-code>生成的代码</mo-ai-code>\`\`\`标签中, 在生成代码前,你需要先列出要生成或者修改的模块名称,然后再开始生成代码,所有列出的模块都必须生成
<我的输入>${command}, 从设计师的角度</我的输入>`

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
