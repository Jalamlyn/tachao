import chatChunk from "../chat/chat-chunk-openai-office"
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
  private _questionCount: number = 0
  private readonly MAX_QUESTIONS: number = 2

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

  private resetQuestionCount(): void {
    this._questionCount = 0
  }

  private incrementQuestionCount(): void {
    this._questionCount++
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
      // 检查是否是新的对话
      if (messages.length <= 1) {
        this.resetQuestionCount()
      }

      updateGenerationProcess("🤖 AI助手正在分析您的需求...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 添加问题计数到系统消息
      const systemMessage = {
        role: "system",
        content: generateFormAgentPrompt(this._rawConfig) + `\n当前提问次数：${this._questionCount}`,
      }

      const allMessages = [systemMessage, ...messages]

      updateGenerationProcess("📝 开始处理您的需求...")
      const response = await this.processAIResponse(allMessages, command, updateGenerationProcess)

      // 处理不同类型的响应
      if (response.includes("<shata-ai-question>")) {
        this.incrementQuestionCount()
        if (this._questionCount >= this.MAX_QUESTIONS) {
          updateGenerationProcess("已达到最大提问次数，将基于现有信息生成表单...")
          const createResult = await this.createForm(messages, command, updateGenerationProcess)
          return {
            type: "support",
            data: createResult,
            generationProcess,
          }
        }
      }

      if (response.includes("<shata-ai-form>")) {
        const createResult = await this.createForm(messages, command, updateGenerationProcess)
        if (createResult?.rawConfig) {
          this.setRawConfig(createResult.rawConfig)
        }
        return {
          type: "support",
          data: createResult,
          generationProcess,
        }
      }

      return {
        type: "question",
        data: response,
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

  private async processAIResponse(messages: Message[], command: string, onChunk: AIResponseHandler): Promise<string> {
    console.log("[AIFormAgent] processAIResponse started with current rawConfig:", this._rawConfig?.substring(0, 100) + "...")
    
    const allMessages = [
      { role: "system", content: generateFormAgentPrompt(this._rawConfig) },
      ...messages
    ]

    let response = ""
    await chatChunk(
      allMessages,
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

    this.clearCachedImage()
    return response
  }

  private async createForm(
    messages: Message[],
    command: string,
    onChunk: AIResponseHandler
  ): Promise<CreateFormResult> {
    console.log("[AIFormAgent] createForm started with current rawConfig:", this._rawConfig?.substring(0, 100) + "...")
    onChunk("🎨 正在设计表单结构...")
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      onChunk("⚡ 正在生成表单配置...\n")
      const response = await this.processAIResponse(messages, command, onChunk)
      console.log("[AIFormAgent] Received AI response, length:", response.length)

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