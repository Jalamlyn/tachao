import chatChunk from "../chat/chat-chunk-openai-office"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import generateFormAgentPrompt from "./prompts/form/form-agent-prompt"
import { Message } from "./AIFormAgentTypes"
import { getMetadata } from "../apis/metadata"
import { localDB } from "@/utils/localDB"

export class AIFormAgent {
  private static instance: AIFormAgent
  private _rawConfig: string | null = null
  private _cachedImage: string | null = null
  private _cachedExcel: { headers: string[]; firstRow: any; fileName: string } | null = null
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

  public cacheImage(imageData: string): void {
    console.log("[AIFormAgent] Caching image data")
    this._cachedImage = imageData
  }

  public clearCachedImage(): void {
    console.log("[AIFormAgent] Clearing cached image")
    this._cachedImage = null
  }

  public cacheExcel(excelData: { headers: string[]; firstRow: any; fileName: string }): void {
    console.log("[AIFormAgent] Caching excel data")
    this._cachedExcel = excelData
  }

  public clearCachedExcel(): void {
    console.log("[AIFormAgent] Clearing cached excel")
    this._cachedExcel = null
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
      const cachedImage = localDB.getItem("cachedImage")
      const cachedExcel = localDB.getItem("cachedExcel")
      let parsedExcel = null
      if (cachedExcel) {
        try {
          parsedExcel = JSON.parse(cachedExcel)
        } catch (e) {
          console.error("Error parsing cached excel:", e)
        }
      }

      const systemMessage = {
        role: "system" as const,
        content: generateFormAgentPrompt(this._rawConfig, !!cachedImage, result.data?.[0]?.value, parsedExcel),
      }

      const enhancedCommand = `这是我的输入
      """
      ${command}
      """
      [
      回答我的问题前先查看是否包含现有配置代码, 在现有配置代码基础上回答我的问题, 并询问我是否需要生成代码, 在没有得到我确认前, 不生成任何话代码,
      回复策略:
        * 对于表单直接相关问题：提供具体解决方案
        * 对于业务相关问题：进行分析并给出建议
        * 对于间接相关问题：提供参考信息和最佳实践
        * 对于完全无关问题：礼貌建议咨询其他专业助手
        * 回复我尽可能简洁和口语化
        * 一次只生成一份 <shata-ai-code>
        * [格式要求:所有代码必须使用 
        \`\`\`mo 
        <shata-ai-code>
          代码
        </shata-ai-code>
        \`\`\` 
        包裹, 严格按照<doc>中的配置来生成代码, 不要使用任何文档中没有的配置, 不要使用注释来省略任何代码或逻辑]`

      const currentUserMessage = {
        role: "user" as const,
        content: enhancedCommand,
        images: cachedImage ? [cachedImage] : undefined,
        excel: parsedExcel,
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

      localDB.removeItem("cachedImage")
      localDB.removeItem("cachedExcel")

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