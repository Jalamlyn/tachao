import chatChunkExpert from "@/service/chat/chat-chunk-openrouter"
import chatChunk from "@/service/chat/chat-deepseek"
import chatChunkOpenAIOffice from "@/service/chat/chat-chunk-openai-azure"
import { Message } from "./AIFormAgentTypes"
import { generateSystemPrompt } from "./prompts/page/page-agent-prompt"
import { balanceStore } from "@/stores/balanceStore"
import { imageStore } from "@/components/AIEditor/components/ImageStore"
import { codeStore } from "@/pages/form-temp-manager/components/codeStore"

export class AIPageAgent {
  private static instance: AIPageAgent
  private _rawCode: string | null = null
  private _imageAnalysisCache: Map<string, string> = new Map()
  private _analysisInProgress: Set<string> = new Set()

  private constructor() {}

  public static getInstance(): AIPageAgent {
    if (!AIPageAgent.instance) {
      AIPageAgent.instance = new AIPageAgent()
    }
    return AIPageAgent.instance
  }

  public getRawCode(): string | null {
    return this._rawCode
  }

  public setRawCode(rawCode: string | null): void {
    this._rawCode = rawCode
  }

  public async getImageAnalysis(imageUrl: string): Promise<{
    result: string
    inProgress: boolean
  }> {
    if (this._imageAnalysisCache.has(imageUrl)) {
      return {
        result: this._imageAnalysisCache.get(imageUrl)!,
        inProgress: false,
      }
    }
    return {
      result: "",
      inProgress: this._analysisInProgress.has(imageUrl),
    }
  }

  public clearImageAnalysis(imageUrl?: string) {
    if (imageUrl) {
      this._imageAnalysisCache.delete(imageUrl)
      this._analysisInProgress.delete(imageUrl)
    } else {
      this._imageAnalysisCache.clear()
      this._analysisInProgress.clear()
    }
  }

  public syncImageAnalysisCache() {
    const currentImages = new Set(imageStore.images)
    for (const [imageUrl] of this._imageAnalysisCache) {
      if (!currentImages.has(imageUrl)) {
        this.clearImageAnalysis(imageUrl)
      }
    }
  }

  private async analyzeImages(images: string[]): Promise<string> {
    if (images.length === 0) return ""

    let allAnalysis = []
    for (const imageUrl of images) {
      if (this._imageAnalysisCache.has(imageUrl)) {
        allAnalysis.push(this._imageAnalysisCache.get(imageUrl))
        continue
      }

      this._analysisInProgress.add(imageUrl)
      try {
        const messages = [
          {
            role: "system",
            content: `你是一个专业的页面设计分析师。请分析图片中的页面内容，并按以下格式返回分析结果：
1. 页面布局：[描述页面的整体布局]
2. 组件列表：
   - 组件名称：[组件类型] - [组件描述]
   - ...
3. 交互逻辑：
   - [描述发现的交互逻辑]
4. 建议的实现方式：
   [描述推荐的实现方案]`,
          },
          {
            role: "user",
            content: "请分析这张图片中的页面内容",
            images: [imageUrl],
          },
        ]

        let response = ""
        await chatChunkOpenAIOffice(
          messages,
          (chunk: string) => {
            response += chunk
          },
          () => {},
          true,
          0,
          "YES"
        )

        this._imageAnalysisCache.set(imageUrl, response)
        allAnalysis.push(response)
      } catch (error) {
        console.error("Error analyzing image:", error)
      } finally {
        this._analysisInProgress.delete(imageUrl)
      }
    }

    return allAnalysis.join("\n\n")
  }

  public async parseCode(code: string) {
    try {
      if (!code.includes("<shata-ai-code>")) {
        throw new Error("Invalid code format")
      }
      return {
        code,
        success: true,
      }
    } catch (error) {
      console.error("Error parsing page code:", error)
      throw error
    }
  }

  public async processCommand(
    messages: Message[],
    command: string,
    onChunk?: (chunk: string) => void,
    rawCode?: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    if (!balanceStore.checkBalance()) {
      throw new Error("余额不足，请前往企业设置-账户进行充值")
    }

    if (rawCode) {
      this.setRawCode(rawCode)
    }

    try {
      const systemPrompt = generateSystemPrompt()

      // 获取图片分析结果
      const cachedImages = imageStore.images
      let imageAnalysis = ""
      if (cachedImages.length > 0) {
        imageAnalysis = await this.analyzeImages(cachedImages)
      }

      // 获取现有代码
      const existingCode = codeStore.code || rawCode

      const enhancedCommand = `
      ${
        imageAnalysis
          ? `
我上传了一张图片, 这是图片的分析结果:
<图片分析结果>
${imageAnalysis}
</图片分析结果>
`
          : ""
      }

${
  existingCode
    ? `
这是现有的代码,请基于它进行优化或修改:
<existing-code>
${existingCode}
</existing-code>
`
    : ""
}

${command}

<代码生成规范>
1. 必须使用 NextUI 组件库
2. 必须使用 Framer Motion 做动画
3. 代码必须完整，不能省略
4. 必须包含在 <shata-ai-code>
export default (props) => {
  const {React, NextUI} = context
  const {Card, CardBody, CardHeader} = NextUI
     // 1. 状态管理
     const [state, setState] = React.useState()
     
     // 2. 副作用处理
     React.useEffect(() => {}, [])
     
     // 3. 事件处理函数
     const handleEvent = React.useCallback(() => {}, [])
     
     // 4. 渲染逻辑
     return (
       <div>
         // 组件内容
       </div>
     )
   }
</shata-ai-code> 标签中
5. 生成的代码必须是一个完整的 React 组件
6. 所有依赖都从 context 中解构获取
7. 不能使用 import/export 语句
</代码生成规范>
      `

      const allMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: enhancedCommand },
      ]

      let response = ""
      const model = sessionStorage.getItem("aiLevel") || "ADVANCED"

      if (model === "ADVANCED") {
        await chatChunk(
          allMessages,
          (chunk: string) => {
            response += chunk
            onChunk?.(chunk)
          },
          () => {},
          true,
          0
        )
      }

      if (model === "EXPERT") {
        await chatChunkExpert(
          allMessages,
          (chunk: string) => {
            response += chunk
            onChunk?.(chunk)
          },
          () => {},
          true,
          0
        )
      }

      // 清理图片缓存
      imageStore.images = []
      this.clearImageAnalysis()

      if (response.includes("<shata-ai-error>")) {
        return {
          success: false,
          error: "生成失败，请重试",
        }
      }

      if (response.includes("<shata-ai-code>")) {
        this.setRawCode(response)
        return {
          success: true,
          code: response,
        }
      }

      return {
        success: true,
      }
    } catch (error) {
      console.error("Error in processCommand:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      }
    }
  }
}

export default AIPageAgent.getInstance()
