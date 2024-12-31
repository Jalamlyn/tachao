import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
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
</project>, <project> 里是现有代码, 你修改现有代码的时候必须每次都返回修改后的完整代码, 不允许有省略和注释任何一行代码
<我的输入>${command}</我的输入>`

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