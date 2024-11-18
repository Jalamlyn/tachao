import chatChunkClaude from "../chat/chat-chunk-claude-office"
import chatChunkQwen from "../chat/chat-siliconflow"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import message from "@/components/Message"
import { markdown as dynamicFormAdvanced } from "@/components/common/DynamicForm/dynamic-form-advanced.md"
import { markdown as dynamicForm } from "@/components/common/DynamicForm/dynamic-form.md"
import { markdown as formulaService } from "@/services/formulaService.md"
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
- 流程信息, 不生成确认按钮,系统会自动生成

明细信息部分的表根根据表单的实际类型生成，是可选的
生成默认的 calculate 计算逻辑，如果没有可计算的字段就默认返回 0
生成明细信息如果涉及到计算的，要生成正确的行计算和合计计算逻辑
生成必要的校验逻辑函数，用于保存的时候对表单数据进行校验
只返回生成的代码，开头不要解释，结尾不要说明
生成的代码中不允许使用 import 语句，不引入任何第三方依赖
processStep 必须在 renderConfig 下
除了计算字段所有字段 disable 都是 false
自定义渲染 render 返回的是 jsx 代码,不是字符串

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
# 动态表单配置文档
${dynamicForm}
${dynamicFormAdvanced}
# 动态表单计算公式文档
${formulaService}
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
您的指令不太明确，我需要更多信息。请尝试：
- 创建一个[表单类型]表单，包含[字段1]、[字段2]等字段
- 在[表单名称]中添加[字段名]字段
- 修改[表单名称]中[字段名]的[属性]
- 删除[表单名称]中的[字段名]字段
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
1. 表单标题(title)：表单的名称
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
