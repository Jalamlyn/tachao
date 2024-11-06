import chatChunkClaude from "../chat/chat-chunk-claude-office"
import message from "@/components/Message"
import { MetadataDetail } from "@/components/from-templates/hook/useMetadata"
import { jsonStringify } from "@/utils"

export type AnalysisResult = {
  type: "query" | "analysis"
  data: any
  rawContent?: string
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

export class FormAnalysisAgent {
  private static instance: FormAnalysisAgent
  private _currentData: MetadataDetail[] | null = null
  private systemPrompt = (data) => `你是沙塔 AI 的智能数据分析助手，负责帮助用户分析和查询表单数据。
你需要理解用户的查询意图，从提供的数据中找出相关信息并给出准确的回答。
你只能回答与提供的数据相关的问题，对于超出数据范围的问题，你需要礼貌地拒绝回答。

分析原则：
1. 直接回答：直接给出用户想要的结果，不要过多解释
2. 数据准确：确保计算和统计的准确性
3. 简明扼要：使用简洁的语言表达结果
4. 灵活查询：支持多维度的数据查询和分析
5. 严格限制：只能回答数据集内的问题，拒绝回答超出范围的问题

注意事项：
- 如果涉及金额，保留两位小数
- 如果涉及日期，使用标准格式
- 如果需要返回表单链接，使用 <a target="_blank" href="/form/表单ID">表单标题</a> 格式
- 如果数据不存在或查询条件不明确，要明确告知用户
- 如果用户询问的内容超出数据范围，要礼貌拒绝并说明原因

这是你要分析的数据:\n${jsonStringify(data)}\n\n
`

  private constructor() {}

  public static getInstance(): FormAnalysisAgent {
    if (!FormAnalysisAgent.instance) {
      FormAnalysisAgent.instance = new FormAnalysisAgent()
    }
    return FormAnalysisAgent.instance
  }

  public getCurrentData(): MetadataDetail[] | null {
    return this._currentData
  }

  private setCurrentData(data: MetadataDetail[] | null): void {
    this._currentData = data
  }

  // 新增: 处理流式响应的方法
  public async streamResponse(
    command: string,
    onChunk: (chunk: string) => void,
    data?: MetadataDetail[]
  ): Promise<void> {
    if (data) {
      this.setCurrentData(data)
    }

    if (!this._currentData) {
      throw new Error("没有可分析的数据，请先提供数据")
    }

    try {
      await chatChunkClaude(
        [
          { role: "system", content: this.systemPrompt(this._currentData) },
          { role: "user", content: command }
        ],
        onChunk,
        () => {},
        true,
        0.7
      )
    } catch (error) {
      console.error("Stream response error:", error)
      throw error
    }
  }

  // 修改: 保持向后兼容的 processCommand 方法
  public async processCommand(
    command: string,
    onChunk?: (chunk: string) => void,
    data?: MetadataDetail[]
  ): Promise<AnalysisResult> {
    if (data) {
      this.setCurrentData(data)
    }

    if (!this._currentData) {
      throw new Error("没有可分析的数据，请先提供数据")
    }

    let response = ""
    try {
      await chatChunkClaude(
        [
          { role: "system", content: this.systemPrompt(this._currentData) },
          { role: "user", content: command }
        ],
        (chunk: string) => {
          response += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0.7
      )

      return {
        type: "query",
        data: response,
        rawContent: response
      }
    } catch (error) {
      console.error("Error in analysis:", error)
      message.error("分析过程中发生错误：" + (error as Error).message)
      throw error
    }
  }

  public clearData(): void {
    this._currentData = null
  }
}

export default FormAnalysisAgent.getInstance()