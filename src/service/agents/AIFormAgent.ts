import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import message from "@/components/Message"
import { markdown as doc } from "@/components/common/DynamicForm/doc.md"
import {
  CommandResult,
  AIFormAgentConfig,
  CreateFormResult,
  IntentAnalysisResult,
  AIResponseHandler,
  Message,
  IAIFormAgent
} from "./AIFormAgentTypes"

export class AIFormAgent implements IAIFormAgent {
  private static instance: AIFormAgent
  private _rawConfig: string | null = null
  private _cachedImage: string | null = null
  private systemPrompt = `你是一个智能表单助手，负责帮助用户创建和检索表单。
每次都生成一个完整的符合 DynamicFormConfig 类型的配置对象，不生成局部修改。
${
  this._rawConfig
    ? `当前表单配置:
${this._rawConfig}

请根据上述配置和用户的需求，生成一个新的完整配置。`
    : ""
}

不要生成 订单编号 的配置，系统会自动生成。
生成的表单必须包含2个部分

- 基本信息
- 流程信息

明细信息部分根据表单的实际类型生成，是可选的
生成默认的 calculate 计算逻辑，如果没有可计算的字段就默认返回 0
生成明细信息如果涉及到计算的，要生成正确的行计算和合计计算逻辑
生成必要的校验逻辑函数，用于保存的时候对表单数据进行校验
只返回生成的代码，开头不要解释，结尾不要说明
生成的代码中不允许使用 import 语句，不引入任何第三方依赖
processStep 必须在 renderConfig 下
除了计算字段所有字段 disable 都是 false

注意：自定义组件只能使用 shadcn UI 组件库中的组件，包括：
- Alert, AlertTitle, AlertDescription
- Button //Button 来自 NextUI
- Card
- Input
- Label
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Textarea
- Calendar

<doc>
${doc}
</doc>
- 仔细阅读 doc 来编写配置，不能编写超出 doc 范围的代码
- 阅读完 doc 和用户需求之后要进行思考和反思
`

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
    this._cachedImage = imageData
  }

  public clearCachedImage(): void {
    this._cachedImage = null
  }

  public async parseConfig(rawConfig: string) {
    try {
      const parsedConfig = await parseFormConfig(rawConfig)
      return parsedConfig
    } catch (error) {
      console.error("Error parsing form config:", error)
      throw new Error("Failed to parse form config")
    }
  }

  public async processCommand(
    command: string,
    onChunk?: AIResponseHandler,
    config?: DynamicFormConfig,
    rawConfig?: string
  ): Promise<CommandResult> {
    console.log("[AIFormAgent] processCommand started with rawConfig:", rawConfig?.substring(0, 100) + "...")
    let generationProcess = ""

    const updateGenerationProcess = (chunk: string) => {
      generationProcess += chunk
      onChunk?.(chunk)
    }

    if (config) {
      this.setCurrentConfig(config)
    }

    if (rawConfig) {
      console.log("[AIFormAgent] Setting new rawConfig in processCommand")
      this.setRawConfig(rawConfig)
    }

    const intent = await this.analyzeIntent(command)

    if (intent === "unsupported") {
      throw new Error("请使用表单创建或编辑相关的指令，让我更好地理解您的需求。")
    }

    updateGenerationProcess("🤖 AI助手正在分析您的需求...\n")
    await new Promise((resolve) => setTimeout(resolve, 500))

    updateGenerationProcess("📝 开始生成表单...\n")
    const createResult = await this.createForm(command, updateGenerationProcess)
    if (createResult) {
      this.setCurrentConfig(createResult.config)
      if (createResult.rawConfig) {
        console.log("[AIFormAgent] Setting new rawConfig from createResult")
        this.setRawConfig(createResult.rawConfig)
      }
    }
    return {
      type: "create",
      data: createResult,
      generationProcess,
    }
  }

  private async processAIResponse(userInput: string, onChunk: AIResponseHandler): Promise<string> {
    console.log(
      "[AIFormAgent] processAIResponse started with current rawConfig:",
      this._rawConfig?.substring(0, 100) + "..."
    )
    let response = ""
    const messages: Message[] = [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: userInput },
    ]

    if (this._cachedImage) {
      messages.push({ role: "user", content: `[Uploaded Image: ${this._cachedImage}]` })
    }

    await chatChunkClaude(
      messages,
      (chunk: string) => {
        response += chunk
        onChunk(chunk)
      },
      () => {},
      true,
      0
    )
    return response
  }

  public async analyzeIntent(input: string): Promise<IntentAnalysisResult> {
    const aiAnalysisPrompt = `请分析以下用户指令，判断是否是表单创建或编辑相关的指令：
"${input}"

请根据以下规则进行分析：
1. 如果是创建、编辑、修改、更新表单的指令，返回 "create"
2. 如果不是表单相关的指令或指令不明确，返回 "unsupported"

请只返回 "create" 或 "unsupported"，不要返回其他内容。`

    try {
      const aiResponse = await this.processAIResponse(aiAnalysisPrompt, () => {})
      const cleanResponse = aiResponse.trim().toLowerCase()

      if (cleanResponse === "create" || cleanResponse === "unsupported") {
        if (cleanResponse === "unsupported") {
          message.warning("请使用表单创建或编辑相关的指令。")
        }
        return cleanResponse as IntentAnalysisResult
      }

      const formKeywords = /(创建|新建|生成|制作|添加|建立|编辑|修改|更新|调整|改变).*?(表单|单据|模板)/
      if (formKeywords.test(input)) {
        return "create"
      }

      message.warning("请使用表单创建或编辑相关的指令。")
      return "unsupported"
    } catch (error) {
      console.error("Error analyzing intent:", error)
      message.error("分析用户意图失败：" + (error as Error).message)
      return "unsupported"
    }
  }

  private async createForm(
    description: string,
    onChunk: AIResponseHandler
  ): Promise<CreateFormResult> {
    console.log("[AIFormAgent] createForm started with current rawConfig:", this._rawConfig?.substring(0, 100) + "...")
    onChunk("🎨 正在设计表单结构...\n")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const prompt = `请根据以下描述生成一个完整的表单配置代码：
${description}

${
  this._rawConfig
    ? `当前表单配置:
${this._rawConfig}

请根据上述配置和用户的需求，生成一个新的完整配置。`
    : ""
}

请生成包含两部分内容的 js 代码：
1. 表单标题(title)：简要概括表单的主要内容
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
      const parsedConfig = await parseFormConfig(response)

      if (!parsedConfig) {
        throw new Error("解析表单配置失败")
      }

      const { title, config } = parsedConfig

      if (!title || !config) {
        throw new Error("表单配置缺少必要的字段")
      }

      onChunk("✨ 表单生成完成！\n")
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

  private setCurrentConfig(config: DynamicFormConfig): void {
    // 实现设置当前配置的逻辑
  }
}

export default AIFormAgent.getInstance()