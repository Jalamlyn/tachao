import chatChunk from "../chat/chat-chunk-openai-office"
// import chatChunk from "../chat/chat-siliconflow"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import message from "@/components/Message"
import generateFormAgentPrompt from "./prompts/form-agent-prompt"
import {
  CommandResult,
  CreateFormResult,
  IntentAnalysisResult,
  AIResponseHandler,
  Message,
  IAIFormAgent,
} from "./AIFormAgentTypes"

export class AIFormAgent implements IAIFormAgent {
  private static instance: AIFormAgent
  private _rawConfig: string | null = null
  private _cachedImage: string | null = null

  private constructor() {}

  public static getInstance(): AIFormAgent {
    if (!AIFormAgent.instance) {
      AIFormAgent.instance = new AIFormAgent()
    }
    return AIFormAgent.instance
  }

  public getRawConfig(): string | null {
    console.log("[AIFormAgent] getRawConfig called, returning:", this._rawConfig?.substring(0, 100) + "...")
    return this._rawConfig
  }

  private setRawConfig(rawConfig: string | null): void {
    console.log("[AIFormAgent] setRawConfig called with:", rawConfig?.substring(0, 100) + "...")
    this._rawConfig = rawConfig
  }

  public cacheImage(imageData: string): void {
    console.log("[AIFormAgent] cacheImage called")
    this._cachedImage = imageData
  }

  public clearCachedImage(): void {
    console.log("[AIFormAgent] clearCachedImage called")
    this._cachedImage = null
  }

  public async parseConfig(rawConfig: string) {
    try {
      const parsedConfig = await parseFormConfig(rawConfig)
      if (!parsedConfig.config.metadata) {
        parsedConfig.config.metadata = {
          title: parsedConfig.title,
        }
      }
      return parsedConfig
    } catch (error) {
      console.error("Error parsing form config:", error)
      throw new Error("Failed to parse form config")
    }
  }

  public async processCommand(
    command: string,
    onChunk?: AIResponseHandler,
    rawConfig?: string
  ): Promise<CommandResult> {
    console.log("[AIFormAgent] processCommand started with rawConfig:", rawConfig)
    let generationProcess = ""

    const updateGenerationProcess = (chunk: string) => {
      generationProcess += chunk
      onChunk?.(chunk)
    }

    if (rawConfig) {
      console.log("[AIFormAgent] Setting new rawConfig in processCommand")
      this.setRawConfig(rawConfig)
    }

    try {
      updateGenerationProcess("🤖 AI助手正在分析您的需求...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      updateGenerationProcess("📝 开始生成表单...")
      const createResult = await this.createForm(command, updateGenerationProcess)

      if (createResult) {
        if (createResult.rawConfig) {
          console.log("[AIFormAgent] Setting new rawConfig from createResult")
          this.setRawConfig(createResult.rawConfig)
        }
      }

      return {
        type: "support",
        data: createResult,
        generationProcess,
      }
    } catch (error) {
      console.error("Error in processCommand:", error)
      return {
        type: "error",
        data: null,
        generationProcess: error.message,
      }
    }
  }

  private async processAIResponse(userInput: string, onChunk: AIResponseHandler): Promise<string> {
    console.log(
      "[AIFormAgent] processAIResponse started with current rawConfig:",
      this._rawConfig?.substring(0, 100) + "..."
    )
    let response = ""
    const messages: Message[] = [
      { role: "system", content: generateFormAgentPrompt(this._rawConfig) },
      {
        role: "user",
        content: userInput,
        images: this._cachedImage ? [this._cachedImage] : undefined,
      },
    ]

    await chatChunk(
      messages,
      (chunk: string) => {
        response += chunk
        onChunk(chunk)
      },
      () => {},
      true,
      0,
      "YES",
      "claude::claude-3-5-sonnet-20241022"
    )

    // 清理缓存的图片
    this.clearCachedImage()

    return response
  }

  private async createForm(description: string, onChunk: AIResponseHandler): Promise<CreateFormResult> {
    console.log("[AIFormAgent] createForm started with current rawConfig:", this._rawConfig?.substring(0, 100) + "...")
    onChunk("🎨 正在设计表单结构...")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const prompt = `请根据以下描述生成一个完整的表单配置代码：
    <description>
${description}
</description>
如果<description>和表单无关，直接返回：
"""
<shata-ai-error>请使用表单创建或编辑相关的指令</shata-ai-error>
"""

如果<description>不够明确，直接返回：
"""
<shata-ai-error>
</shata-ai-error>
"""

${
  this._rawConfig
    ? `当前表单配置:
${this._rawConfig}

请根据上述配置和用户的需求，生成一个新的完整配置。`
    : ""
}

请生成包含两部分内容的 js 代码：
1. 表单标题(title)：表单的名称,要有业务含义,不要随意变更
2. 表单配置(config)：一个完整的符合 DynamicFormConfig 类型的配置 js 对象

请使用如下格式返回：
"""
\`\`\`mo
<shata-ai-form>
export default {
  title,
  config:{
    // 完整的表单配置对象
  }
}
</shata-ai-form>
\`\`\`
"""
`

    try {
      onChunk("⚡ 正在生成表单配置...\n")
      const response = await this.processAIResponse(prompt, onChunk)
      console.log("[AIFormAgent] Received AI response, length:", response.length)

      // 检查是否包含错误或不明确提示
      if (response.includes("<error>")) {
        const errorMatch = response.match(/<error>(.*?)<\/error>/s)
        throw new Error(errorMatch ? errorMatch[1].trim() : "无效的表单指令")
      }

      if (response.includes("<unclear>")) {
        const unclearMatch = response.match(/<unclear>(.*?)<\/unclear>/s)
        throw new Error(unclearMatch ? unclearMatch[1].trim() : "指令不明确")
      }

      const parsedConfig = await parseFormConfig(response)

      if (!parsedConfig) {
        throw new Error("解析表单配置失败")
      }

      const { title, config } = parsedConfig

      if (!title || !config) {
        throw new Error("表单配置缺少必要的字段")
      }

      onChunk("✨ 表单生成完成！")
      console.log("[AIFormAgent] Form generation completed, returning new rawConfig")
      return {
        config: config as DynamicFormConfig,
        rawConfig: response,
        title: title as string,
      }
    } catch (error) {
      console.error("Error creating form:", error)
      throw new Error("创建表单失败：" + (error as Error).message)
    }
  }
}

export default AIFormAgent.getInstance()
