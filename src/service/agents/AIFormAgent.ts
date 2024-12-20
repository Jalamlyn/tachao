// import chatChunk from "../chat/chat-chunk-openai-office"
import chatChunk from "../chat/chat-chunk-openai-azure"
// import chatChunk from "../chat/chat-chunk-claude-horay"
// import chatChunk from "../chat/chat-chunk-gemini-office"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import generateFormAgentPrompt from "./prompts/form/form-agent-prompt"
import { Message } from "./AIFormAgentTypes"
import { getMetadata } from "../apis/metadata"
import { imageStore } from "@/components/AIEditor/components/ImageStore"
import { excelStore } from "@/components/AIEditor/components/excelStore"

export class AIFormAgent {
  private static instance: AIFormAgent
  private _rawConfig: string | null = null
  private _versionIndex: number = 0

  private constructor() {}

  public static getInstance(): AIFormAgent {
    if (!AIFormAgent.instance) {
      AIFormAgent.instance = new AIFormAgent()
    }
    return AIFormAgent.instance
  }

  public getRawConfig(): string | null {
    return this._rawConfig
  }

  public setRawConfig(rawConfig: string | null, versionIndex?: number): void {
    this._rawConfig = rawConfig
    if (typeof versionIndex === "number") {
      this._versionIndex = versionIndex
    }
  }

  public getVersionIndex(): number {
    return this._versionIndex
  }

  public setVersionIndex(index: number): void {
    this._versionIndex = index
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
      console.error("Error parsing form config:", error, rawConfig)
      throw new Error("Failed to parse form config")
    }
  }

  public async processCommand(
    messages: Message[],
    command: string,
    onChunk?: (chunk: string) => void,
    rawConfig?: string
  ): Promise<{ success: boolean; config?: DynamicFormConfig; rawConfig?: string }> {
    console.log("[AIFormAgent] processCommand started")

    if (rawConfig) {
      this.setRawConfig(rawConfig)
    }
    const result = await getMetadata([`resource_index`])
    try {
      const cachedImages = imageStore.images
      const cachedExcel = excelStore.cachedExcel

      const systemMessage = {
        role: "system" as const,
        content: generateFormAgentPrompt(
          this._rawConfig,
          cachedImages.length > 0,
          result.data?.[0]?.value,
          cachedExcel
        ),
      }

      const enhancedCommand = `在这份代码"""
      ${this._rawConfig}
      """上继续修改实现我的需求或者回答我的问题"""${command}"""如果修改代码, 要返回修改后的完整代码,不能省略任何代码和逻辑,必须是完整的代码,类似这种返回
      """
      const formConfig = {
      // ... 保持原有配置不变 ...
      watch: (form) => {
      """
      都是错误的, 会导致代码无法运行, 不允许用注释省略代码, 如果修改很简单, 可以返回修改的片段指导用户手动修改`

      const currentUserMessage = {
        role: "user" as const,
        content: enhancedCommand,
        images: cachedImages,
        excel: cachedExcel,
      }

      const allMessages = [systemMessage, ...messages, currentUserMessage]

      let response = ""
      await chatChunk(
        allMessages,
        (chunk: string) => {
          response += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0,
        "YES"
      )
      imageStore.images = []
      excelStore.cachedExcel = null

      if (response.includes("<shata-ai-error>")) {
        return {
          success: false,
          config: undefined,
          rawConfig: undefined,
        }
      }

      if (response.includes("<shata-ai-code>")) {
        const parsedConfig = await this.parseConfig(response)
        if (parsedConfig) {
          this.setRawConfig(response)
          return {
            success: true,
            config: parsedConfig.config,
            rawConfig: response,
          }
        }
      }

      return {
        success: true,
        config: undefined,
        rawConfig: undefined,
      }
    } catch (error) {
      console.error("Error in processCommand:", error)
      return {
        success: false,
        config: undefined,
        rawConfig: undefined,
      }
    }
  }
}

export default AIFormAgent.getInstance()
