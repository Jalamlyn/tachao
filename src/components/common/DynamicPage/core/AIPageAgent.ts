import { PageConfig } from '../types/page'
import chatChunkClaude from "@/service/chat/chat-chunk-claude-office"
import { parsePageConfig } from '../utils/parser'
import message from "@/components/Message"

export interface AIResponse {
  type: 'success' | 'error'
  data?: PageConfig
  error?: string
}

export class AIPageAgent {
  private static instance: AIPageAgent
  private _rawConfig: string | null = null
  private _cachedImage: string | null = null
  
  private systemPrompt = `你是一个智能页面助手，负责帮助用户创建和检索页面。
每次都生成一个完整的符合 PageConfig 类型的配置对象。
${this._rawConfig ? `当前页面配置:
${this._rawConfig}

请根据上述配置和用户的需求，生成一个新的完整配置。` : ""}

生成的页面必须包含:
- 页面元数据
- 布局配置
- 内容配置

请使用如下格式返回：
"""
\`\`\`mo
<shata-ai-page>
{
  metadata: {
    title: string
    description?: string
  },
  layout: LayoutConfig,
  content: ContentConfig[]
}
</shata-ai-page>
\`\`\`
"""

只返回生成的代码，开头不要解释，结尾不要说明。`

  private constructor() {}
  
  public static getInstance(): AIPageAgent {
    if (!AIPageAgent.instance) {
      AIPageAgent.instance = new AIPageAgent()
    }
    return AIPageAgent.instance
  }
  
  public getRawConfig(): string | null {
    return this._rawConfig
  }
  
  private setRawConfig(rawConfig: string | null): void {
    this._rawConfig = rawConfig
  }
  
  public cacheImage(imageData: string): void {
    this._cachedImage = imageData
  }
  
  public clearCachedImage(): void {
    this._cachedImage = null
  }
  
  private async processAIResponse(
    userInput: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    let response = ""
    const messages = [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: userInput },
    ]
    
    if (this._cachedImage) {
      messages.push({
        role: "user",
        content: `[Uploaded Image: ${this._cachedImage}]`
      })
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
  
  public async generatePage(
    description: string,
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    try {
      const response = await this.processAIResponse(
        description,
        onChunk || (() => {})
      )
      
      const config = await parsePageConfig(response)
      if (!config) {
        throw new Error("解析页面配置失败")
      }
      
      this.setRawConfig(response)
      
      return {
        type: 'success',
        data: config
      }
    } catch (error) {
      console.error("Error generating page:", error)
      message.error("生成页面失败：" + (error as Error).message)
      return {
        type: 'error',
        error: (error as Error).message
      }
    }
  }
}

export default AIPageAgent.getInstance()