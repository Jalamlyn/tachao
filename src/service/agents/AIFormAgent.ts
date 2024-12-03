import chatChunk from "../chat/chat-chunk-openai-office"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import generateFormAgentPrompt from "./prompts/form-agent-prompt"
import { Message } from "./AIFormAgentTypes"

export class AIFormAgent {
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
    return this._rawConfig
  }

  private setRawConfig(rawConfig: string | null): void {
    this._rawConfig = rawConfig
  }

  public cacheImage(imageData: string): void {
    this._cachedImage = imageData
  }

  public clearCachedImage(): void {
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
    messages: Message[],
    command: string,
    onChunk?: (chunk: string) => void,
    rawConfig?: string
  ): Promise<{ success: boolean; config?: DynamicFormConfig; rawConfig?: string }> {
    console.log("[AIFormAgent] processCommand started")
    let generationProcess = ""

    if (rawConfig) {
      this.setRawConfig(rawConfig)
    }

    try {
      // 构建系统消息
      const systemMessage = {
        role: "system" as const,
        content: generateFormAgentPrompt(this._rawConfig),
      }

      // 构建当前用户消息
      const currentUserMessage = {
        role: "user" as const,
        content: command,
      }

      // 组合所有消息
      const allMessages = [systemMessage, ...messages, currentUserMessage]

      // 获取AI响应
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

      // 检查是否包含错误信息
      if (response.includes("<shata-ai-error>")) {
        const errorMatch = response.match(/<shata-ai-error>(.*?)<\/shata-ai-error>/s)
        return {
          success: false,
          config: undefined,
          rawConfig: undefined,
        }
      }

      // 检查是否包含表单配置
      if (response.includes("<shata-ai-form>")) {
        const formMatch = response.match(/<shata-ai-form>([\s\S]*?)<\/shata-ai-form>/)
        if (formMatch) {
          const formContent = formMatch[1].trim()
          const parsedConfig = await this.parseConfig(formContent)

          if (parsedConfig) {
            this.setRawConfig(formContent)
            return {
              success: true,
              config: parsedConfig.config,
              rawConfig: formContent,
            }
          }
        }
      }

      // 如果没有找到表单配置，返回成功但没有配置
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
