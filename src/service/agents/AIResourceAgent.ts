import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"

export type ResourceColumn = {
  header: string
  accessorKey: string
}

export type ResourceIntent = "modify" | "analyze" | "unsupported" | "unclear"

export type ResourceOperation = {
  type: "set" | "calculate" | "code"
  field?: string
  value?: any
  formula?: string
  code?: string
}

export interface ResourceAgentResult {
  success: boolean
  message: string
  operations?: ResourceOperation[]
}

export class AIResourceAgent {
  private static instance: AIResourceAgent
  private _columns: ResourceColumn[] = []
  private _data: any[] = []
  private systemPrompt = `你是一个智能资料助手，负责帮助用户对资料进行操作和分析。
请仔细分析用户的意图，生成相应的操作代码。

资料列定义:
${JSON.stringify(this._columns, null, 2)}

你可以:
1. 修改资料 - 通过 JavaScript 代码修改数据
2. 分析计算 - 通过 formulajs 进行计算

生成的操作代码格式:
{
  type: "code",
  code: "// JavaScript 代码，用于修改数据"
}

或者:
{
  type: "calculate",
  formula: "// formulajs 计算公式"
}

注意:
- 只返回操作代码，不要返回其他内容
- 计算时可以使用 formulajs 提供的所有函数
- 修改数据时使用标准的 JavaScript 代码
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

  public setData(data: any[]): void {
    this._data = data
  }

  private async executeCode(code: string): Promise<any> {
    try {
      // 创建一个新的函数来执行代码，传入数据作为参数
      const executeFunction = new Function("data", "formulajs", code)
      return executeFunction(this._data, formulaService)
    } catch (error) {
      console.error("Error executing code:", error)
      throw error
    }
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
    const intentSpecificPrompt = intent === "modify"
      ? "请生成修改资料的 JavaScript 代码。使用标准的 JavaScript 语法，返回 type: 'code' 的操作。"
      : "请生成分析计算的代码。使用 formulajs 提供的函数，返回 type: 'calculate' 的操作。"

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
      const operations = JSON.parse(response)
      // 兼容旧版本的 set 操作
      if (Array.isArray(operations)) {
        return operations.map(op => {
          if (op.type === "set") {
            return {
              type: "code",
              code: `data.forEach(row => { if (${op.condition || 'true'}) { row['${op.field}'] = ${JSON.stringify(op.value)}; } });`
            }
          }
          return op
        })
      }
      return operations
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
          ? "请明确指出要修改的内容，例如：'将所有销售金额大于1000的记录标记为重要客户'"
          : "请明确指出要分析的内容，例如：'使用 formulajs 计算所有销售金额的总和'"
        
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

      // 执行操作
      for (const operation of operations) {
        if (operation.type === "code") {
          await this.executeCode(operation.code)
        } else if (operation.type === "calculate") {
          const result = formulaService.evaluateFormula(operation.formula, this._data)
          if (result.error) {
            throw new Error(`计算错误: ${result.error}`)
          }
        }
      }

      return {
        success: true,
        message: "操作执行成功",
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