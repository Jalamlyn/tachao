import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { jsonParse } from "@/utils"
import message from "@/components/Message"
import { MetadataDetail } from "@/components/from-templates/hook/useMetadata"

export type AnalysisResult = {
  type: "query" | "analysis"
  data: any
  generationProcess?: string
}

// 添加格式化时间的辅助函数
const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export class FormAnalysisAgent {
  private static instance: FormAnalysisAgent
  private _currentData: MetadataDetail[] | null = null
  private systemPrompt = `你是一个智能数据分析助手，负责帮助用户分析和查询表单数据。
你需要理解用户的查询意图，从提供的数据中找出相关信息并给出准确的回答。

分析原则：
1. 直接回答：直接给出用户想要的结果，不要过多解释
2. 数据准确：确保计算和统计的准确性
3. 简明扼要：使用简洁的语言表达结果
4. 灵活查询：支持多维度的数据查询和分析

注意事项：
- 如果涉及金额，保留两位小数
- 如果涉及日期，使用标准格式
- 如果需要返回表单链接，使用 <a target="_blank" href="/forms/表单ID">表单标题</a> 格式
- 如果数据不存在或查询条件不明确，要明确告知用户
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

  public async processQuery(
    query: string,
    onChunk?: (chunk: string) => void,
    data?: MetadataDetail[]
  ): Promise<AnalysisResult> {
    let generationProcess = ""
    
    // 记录用户输入和时间
    const userInputTime = formatTime()
    generationProcess += `[${userInputTime}] 👤 用户: ${query}\n\n`
    
    const updateGenerationProcess = (chunk: string) => {
      // 如果是新的AI回复开始,添加时间戳
      if (chunk.startsWith("🤖") || chunk.startsWith("📊") || chunk.startsWith("🔍") || 
          chunk.startsWith("📈") || chunk.startsWith("💡") || chunk.startsWith("✨")) {
        const timestamp = formatTime()
        generationProcess += `[${timestamp}] `
      }
      generationProcess += chunk
      onChunk?.(chunk)
    }

    if (data) {
      this.setCurrentData(data)
    }

    if (!this._currentData) {
      throw new Error("没有可分析的数据，请先提供数据")
    }

    updateGenerationProcess("🤖 AI助手正在分析您的查询...\n")
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const dataContext = JSON.stringify(this._currentData)
      let response = ""

      await chatChunkClaude(
        [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: `这是要分析的数据:\n${dataContext}\n\n用户查询: ${query}` }
        ],
        (chunk: string) => {
          response += chunk
          updateGenerationProcess(chunk)
        },
        () => {},
        true,
        0.7
      )

      return {
        type: "query",
        data: response,
        generationProcess
      }
    } catch (error) {
      console.error("Error in analysis:", error)
      message.error("分析过程中发生错误：" + (error as Error).message)
      throw error
    }
  }

  public async analyzeData(
    data: MetadataDetail[],
    analysisType: string,
    onChunk?: (chunk: string) => void
  ): Promise<AnalysisResult> {
    let generationProcess = ""
    
    const userInputTime = formatTime()
    generationProcess += `[${userInputTime}] 📊 开始${analysisType}分析\n\n`
    
    const updateGenerationProcess = (chunk: string) => {
      if (chunk.startsWith("🤖") || chunk.startsWith("📊") || chunk.startsWith("📈")) {
        const timestamp = formatTime()
        generationProcess += `[${timestamp}] `
      }
      generationProcess += chunk
      onChunk?.(chunk)
    }

    this.setCurrentData(data)

    updateGenerationProcess("📊 正在进行数据分析...\n")
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const dataContext = JSON.stringify(data)
      let response = ""

      await chatChunkClaude(
        [
          { role: "system", content: this.systemPrompt },
          { 
            role: "user", 
            content: `请对以下数据进行${analysisType}分析，给出关键发现和洞察:\n${dataContext}` 
          }
        ],
        (chunk: string) => {
          response += chunk
          updateGenerationProcess(chunk)
        },
        () => {},
        true,
        0.7
      )

      return {
        type: "analysis",
        data: response,
        generationProcess
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