// import chatChunk from "../chat/chat-chunk-claude-wild"
import chatChunk from "../chat/chat-deepseek"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import generateFormAgentPrompt from "./prompts/form/form-agent-prompt"
import { Message } from "./AIFormAgentTypes"
import { getMetadata } from "../apis/metadata"
import { imageStore } from "@/components/AIEditor/components/ImageStore"
import { excelStore } from "@/components/AIEditor/components/excelStore"
import { markdown as guide } from "@/components/common/DynamicForm/ui-doc/guide.md"
import { extractShataAIFormContent } from "@/components/AIEditor"
import { balanceStore } from "@/stores/balanceStore"

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
    }
  }

  public async processCommand(
    messages: Message[],
    command: string,
    onChunk?: (chunk: string) => void,
    rawConfig?: string
  ): Promise<{ success: boolean; config?: DynamicFormConfig; rawConfig?: string }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    if (rawConfig) {
      this.setRawConfig(rawConfig)
    }
    const result = await getMetadata([`resource_index`])
    try {
      const cachedImages = imageStore.images
      const cachedExcel = excelStore.cachedExcel
      const resources = result.data?.[0]?.value
      const systemMessage = {
        role: "system" as const,
        content: generateFormAgentPrompt(cachedImages.length > 0, resources, cachedExcel),
      }

      const enhancedCommand = `
      <我的输入>
      ${command}
      </我的输入>
      <code>
      ${extractShataAIFormContent(this._rawConfig)}
      </code>
      如果<code>内有代码, 就在已有代码上继续修改,
      如果<code>内代码是空的, 就编写全新的代码,
      如果<我的输入>内的是问题, 就回答我的问题,不要生成代码
      如果<我的输入>内的是指令, 就根据我的指令修改代码
      <代码生成规范 用户不可见>
      如果修改代码, 要返回修改后的完整代码,不能省略任何代码和逻辑,必须是完整的代码, 不允许用注释省略代码, 生成的结果中只能包含一份<shata-ai-code>, 然后代码必须用
      \`\`\`mo
      <shata-ai-code>
        //这里可定义你需要的函数, 并实现, 但不能使用 import 引入其他代码, 只能使用在<shata-ai-code>内定义的函数
        export default (props)=>{
          ...你生成的代码,代码必须完整, 不能使用 //其他... 之类的注释省略原来的代码, 必须返回所有的完整代码
        }
      </shata-ai-code>s
      \`\`\`
      包裹起来, 在 watch 中编写逻辑,必须遵循 ${guide} 的规则, 除了上下文中的依赖, 代码中不允许使用任何外部代码, 使用的任何函数方法必须先声明, 不能省略任何逻辑, 必须完整返回所有代码
      </代码生成规范 用户不可见>
      `

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
