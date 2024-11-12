import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"

export type ResourceColumn = {
  header: string
  accessorKey: string
}

export type ResourceIntent = "modify" | "analyze" | "unsupported" | "unclear"

export type ResourceOperation = {
  type: "set" | "calculate"
  field?: string
  value?: any
  formula?: string
}

export interface ResourceAgentResult {
  success: boolean
  message: string
  operations?: ResourceOperation[]
}

export class AIResourceAgent {
  private static instance: AIResourceAgent
  private _columns: ResourceColumn[] = []
  private systemPrompt = `你是一个智能资料助手，负责帮助用户对资料进行操作和分析。
请仔细分析用户的意图，生成相应的操作代码。

资料列定义:
${JSON.stringify(this._columns, null, 2)}

你可以:
1. 修改资料 - 通过 set 操作修改字段值
2. 分析计算 - 通过 js 代码计算字段值

生成的操作代码格式:
{
  type: "set" | "calculate",
  field?: string,  // 要操作的字段
  value?: any,     // 设置的值
  formula?: string // 计算公式
}

注意:
- 只返回操作代码，不要返回其他内容
- 计算时可以使用 JavaScript 内置函数
- 不要生成修改表结构的操作
`

  private constructor() {}

  public static getInstance(): AIResourceAgent {
    if (!AIResourceAgent.instance) {
      AIResourceAgent.instance = new AIResourceAgent()
    }
    return AIResourceAgent.instance
  }

  public setColumns(columns: ResourceColumn[]): void {
    this._columns = columns
  }

  private async analyzeIntent(input: string, mode?: string): Promise<ResourceIntent> {
    // 如果提供了模式，直接返回对应的意图
    if (mode === "modify") return "modify"
    if (mode === "analyze") return "analyze"

    const aiAnalysisPrompt = `请分析以下用户指令，判断是否是资料操作相关的指令：
"${input}"

请根据以下规则进行分析：
1. 如果是修改资料的指令，返回 "modify"
2. 如果是分析计算的指令，返回 "analyze"
3. 如果不是资料相关的指令，返回 "unsupported"
4. 如果是资料相关但指令不够明确，返回 "unclear"

请只返回 "modify"、"analyze"、"unsupported" 或 "unclear"，不要返回其他内容。`

    try {
      const messages: Message[] = [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: aiAnalysisPrompt },
      ]

      let response = ""
      await chatChunkClaude(
        messages,
        (chunk: string) => {
          response += chunk
        },
        () => {},
        true,
        0
      )

      const intent = response.trim().toLowerCase() as ResourceIntent
      return ["modify", "analyze", "unsupported", "unclear"].includes(intent) ? intent : "unclear"
    } catch (error) {
      console.error("Error analyzing intent:", error)
      return "unsupported"
    }
  }

  private async generateOperations(input: string, intent: ResourceIntent): Promise<ResourceOperation[]> {
    // 根据不同意图调整系统提示
    const intentSpecificPrompt = intent === "modify"
      ? "请生成修改资料的操作代码。注意只能使用 set 类型的操作。"
      : "请生成分析计算的操作代码。注意使用 calculate 类型的操作，并提供准确的计算公式。"

    const messages: Message[] = [
      { 
        role: "system", 
        content: `${this.systemPrompt}\n${intentSpecificPrompt}` 
      },
      { role: "user", content: input },
    ]

    let response = ""
    await chatChunkClaude(
      messages,
      (chunk: string) => {
        response += chunk
      },
      () => {},
      true,
      0
    )

    try {
      return JSON.parse(response)
    } catch (error) {
      console.error("Error parsing operations:", error)
      return []
    }
  }

  public async processCommand(
    command: string, 
    onChunk?: (chunk: string) => void,
    mode?: string
  ): Promise<ResourceAgentResult> {
    if (!this._columns.length) {
      return {
        success: false,
        message: "请先设置资料列定义",
      }
    }

    const updateProgress = (message: string) => {
      onChunk?.(message + "</br>")
    }

    try {
      updateProgress("🤖 AI助手正在分析您的需求...")
      const intent = await this.analyzeIntent(command, mode)

      if (intent === "unsupported") {
        return {
          success: false,
          message: "请使用资料操作相关的指令",
        }
      }

      if (intent === "unclear") {
        const suggestion = mode === "modify"
          ? "请明确指出要修改的字段和新的值，例如：'将第一行的姓名改为张三'"
          : "请明确指出要分析的内容，例如：'计算所有销售金额的总和'"
        
        return {
          success: false,
          message: `您的指令不够明确。${suggestion}`,
        }
      }

      updateProgress(`📝 开始${intent === "modify" ? "修改资料" : "分析计算"}...`)
      const operations = await this.generateOperations(command, intent)

      if (!operations.length) {
        return {
          success: false,
          message: "生成操作失败，请重试",
        }
      }

      return {
        success: true,
        message: "操作生成成功",
        operations,
      }
    } catch (error) {
      console.error("Error processing command:", error)
      return {
        success: false,
        message: "处理指令时发生错误：" + (error as Error).message,
      }
    }
  }
}

export default AIResourceAgent.getInstance()