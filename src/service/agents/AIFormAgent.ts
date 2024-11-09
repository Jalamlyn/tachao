import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { jsonParse, jsonStringify } from "@/utils"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import message from "@/components/Message"
import React from "react"

// 导入 shadcn UI 组件
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@nextui-org/button"

// shadcn UI 组件映射
const uiComponents = {
  Alert,
  AlertTitle,
  AlertDescription,
  Button, //NextUI
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Calendar,
}

interface FormIndex {
  id: string
  templateId: string
  status: string
  title: string
}

export type CommandResult = {
  type: "create" | "search"
  data: any
  generationProcess?: string
}

// 添加格式化时间的辅助函数
const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export class AIFormAgent {
  private static instance: AIFormAgent
  private _currentConfig: DynamicFormConfig | null = null
  private _cachedImage: string | null = null
  private systemPrompt = `你是一个智能表单助手，负责帮助用户创建和检索表单。
每次都生成一个完整的符合 DynamicFormConfig 类型的配置对象，不生成局部修改。
检索表单时，你需要根据用户的描述在表单索引中查找匹配的表单。

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

  public getCurrentConfig(): DynamicFormConfig | null {
    return this._currentConfig
  }

  private setCurrentConfig(config: DynamicFormConfig | null): void {
    this._currentConfig = config
  }

  public cacheImage(imageData: string): void {
    this._cachedImage = imageData
  }

  public clearCachedImage(): void {
    this._cachedImage = null
  }

  public async processCommand(
    command: string,
    onChunk?: (chunk: string) => void,
    config?: DynamicFormConfig
  ): Promise<CommandResult> {
    let generationProcess = ""

    // 记录用户输入和时间
    const userInputTime = formatTime()
    generationProcess += `[${userInputTime}] 👤 用户: ${command}\n\n`

    const updateGenerationProcess = (chunk: string) => {
      // 如果是新的AI回复开始,添加时间戳
      if (
        chunk.startsWith("🤖") ||
        chunk.startsWith("📝") ||
        chunk.startsWith("✏️") ||
        chunk.startsWith("🔍") ||
        chunk.startsWith("⚡") ||
        chunk.startsWith("✨") ||
        chunk.startsWith("🎨") ||
        chunk.startsWith("🛠️") ||
        chunk.startsWith("✅") ||
        chunk.startsWith("📋")
      ) {
        const timestamp = formatTime()
        generationProcess += `[${timestamp}] `
      }
      generationProcess += chunk
      onChunk?.(chunk)
    }

    if (config) {
      this.setCurrentConfig(config)
    }

    const intent = await this.analyzeIntent(command)

    if (intent === "unsupported") {
      throw new Error("不支持的指令，请使用'创建'、'检索'或'编辑'开头的指令，让我更好的理解您的意图。")
    }

    updateGenerationProcess("🤖 AI助手正在分析您的需求...\n")
    await new Promise((resolve) => setTimeout(resolve, 500))

    switch (intent) {
      case "create":
      case "edit":
        updateGenerationProcess("📝 开始生成表单...\n")
        const createResult = await this.createForm(command, updateGenerationProcess)
        if (createResult) {
          this.setCurrentConfig(createResult.config)
        }
        return {
          type: "create",
          data: createResult,
          generationProcess,
        }
      case "search":
        updateGenerationProcess("🔍 开始搜索表单...\n")
        const searchResult = await this.searchForms(command, [], updateGenerationProcess)
        return {
          type: "search",
          data: searchResult,
          generationProcess,
        }
      default:
        throw new Error("未知的指令类型")
    }
  }

  private async processAIResponse(userInput: string, onChunk: (chunk: string) => void): Promise<string> {
    let response = ""
    const messages = [
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

  public async analyzeIntent(input: string): Promise<"create" | "search" | "edit" | "unsupported"> {
    const aiAnalysisPrompt = `请分析以下用户指令的意图，判断是否是合法的表单操作指令：
"${input}"

请根据以下规则进行分析：
1. 如果是创建/新建/生成表单的指令，返回 "create"
2. 如果是搜索/查找/检索表单或资料的指令，返回 "search"
3. 如果是编辑/修改/更新表单的指令，返回 "create"
4. 如果不是表单相关的指令或指令不明确，返回 "unsupported"

请只返回 "create"、"search" 或 "unsupported"，不要返回其他内容。`

    try {
      const aiResponse = await this.processAIResponse(aiAnalysisPrompt, () => {})
      const cleanResponse = aiResponse.trim().toLowerCase()

      if (cleanResponse === "create" || cleanResponse === "search" || cleanResponse === "unsupported") {
        if (cleanResponse === "unsupported") {
          message.warning("不支持的指令，请使用创建表单或检索表单相关的指令。")
        }
        return cleanResponse as "create" | "search" | "edit" | "unsupported"
      }

      const createKeywords = /(创建|新建|生成|制作|添加|建立|编辑|修改|更新|调整|改变).*?(表单|单据|模板)/
      if (createKeywords.test(input)) {
        return "create"
      }

      const searchKeywords = /(搜索|查找|检索|查询|寻找|浏览).*?(表单|单据|资料|模板)/
      if (searchKeywords.test(input)) {
        return "search"
      }

      message.warning("不支持的指令，请使用创建表单或检索表单相关的指令。")
      return "unsupported"
    } catch (error) {
      console.error("Error analyzing intent:", error)
      message.error("分析用户意图失败：" + (error as Error).message)
      return "unsupported"
    }
  }

  private async createForm(
    description: string,
    onChunk: (chunk: string) => void
  ): Promise<{
    config: DynamicFormConfig
    title: string
  } | null> {
    onChunk("🎨 正在设计表单结构...\n")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const prompt = `请根据以下描述生成一个完整的表单配置代码：
${description}

${this._currentConfig ? `当前表单配置:
${jsonStringify(this._currentConfig)}

请根据上述配置和用户的需求，生成一个新的完整配置。` : ''}

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
      const parsedConfig = await parseFormConfig(response)

      if (!parsedConfig) {
        throw new Error("解析表单配置失败")
      }

      const { title, config } = parsedConfig

      if (!title || !config) {
        throw new Error("表单配置缺少必要的字段")
      }

      onChunk("✨ 表单生成完成！\n")
      return {
        config: config as DynamicFormConfig,
        title: title as string,
      }
    } catch (error) {
      console.error("Error creating form:", error)
      throw new Error("创建表单失败：" + (error as Error).message)
    }
  }

  private async searchForms(
    query: string,
    formsIndex: FormIndex[],
    onChunk: (chunk: string) => void
  ): Promise<FormIndex[]> {
    onChunk("🔍 正在搜索匹配的表单...\n")
    await new Promise((resolve) => setTimeout(resolve, 300))

    const prompt = `请根据用户的查询条件"${query}"，在以下表单索引中查找匹配的表单：
${jsonStringify(formsIndex)}

请返回匹配的表单数组，格式如下：
"""
\`\`\`mo
<shata-ai-result>
export default getMatchedForms() {
  return [
    // 匹配的表单索引数组
  ]
}
</shata-ai-result>
\`\`\`
"""
注意：
1. 只返回与查询条件相关的表单
2. 如果没有匹配的表单，返回空数组
3. 返回的数组元素必须来自原始数据，不要修改或添加新字段`

    try {
      const response = await this.processAIResponse(prompt, onChunk)
      const match = response.match(/<shata-ai-result>([\s\S]*?)<\/shata-ai-result>/)

      onChunk("📋 搜索完成！\n")

      if (!match) {
        throw new Error("AI 响应格式错误")
      }

      const results = jsonParse(match[1])
      return Array.isArray(results) ? results : []
    } catch (error) {
      console.error("Error searching forms:", error)
      throw new Error("搜索表单失败：" + (error as Error).message)
    }
  }
}

export default AIFormAgent.getInstance()