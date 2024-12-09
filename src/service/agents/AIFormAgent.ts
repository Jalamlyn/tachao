import chatChunk from "../chat/chat-chunk-openai-office"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import generateFormAgentPrompt from "./prompts/form-agent-prompt"
import { Message } from "./AIFormAgentTypes"
import { getMetadata } from "../apis/metadata"

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
    console.log("[AIFormAgent] Caching image data")
    this._cachedImage = imageData
  }

  public clearCachedImage(): void {
    console.log("[AIFormAgent] Clearing cached image")
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
      console.error("Error parsing form config:", error, rawConfig)
      // message.error("表单解析失败")
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
      // 构建系统消息
      const systemMessage = {
        role: "system" as const,
        content: generateFormAgentPrompt(this._rawConfig, this._cachedImage !== null, result.data?.[0]?.value),
      }

      // 增强用户命令，添加意图控制
      const enhancedCommand = `${command}
      [意图控制: 
      - 主要职责: 我是表单设计助手，专注于帮助用户设计和优化表单系统。
      - 回答策略:
        * 对于表单直接相关问题：提供具体解决方案
        * 对于业务相关问题：进行分析并给出建议
        * 对于间接相关问题：提供参考信息和最佳实践
        * 对于完全无关问题：礼貌建议咨询其他专业助手
      - 互动原则:
        * 优先理解用户意图
        * 结合上下文分析
        * 提供建设性建议
        * 引导用户明确需求,用户确认后再生成表单][格式要求:不要遗漏 \`\`\`mo 标记,不要遗漏 <shata-ai 的标记]`

      // 构建当前用户消息，检查是否有缓存图片
      const currentUserMessage = {
        role: "user" as const,
        content: enhancedCommand,
        // 如果有缓存图片，添加到 images 数组中
        images: this._cachedImage ? [this._cachedImage] : undefined,
      }

      // 组合所有消息
      const allMessages = [systemMessage, ...messages, currentUserMessage]

      console.log("[AIFormAgent] Sending messages with image:", !!this._cachedImage)

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

      // 使用完图片后清除缓存
      this.clearCachedImage()

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
        const parsedConfig = await this.parseConfig(response)
        if (parsedConfig) {
          this.setRawConfig(response) // parseConfig 会返回原始配置
          return {
            success: true,
            config: parsedConfig.config,
            rawConfig: response,
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
