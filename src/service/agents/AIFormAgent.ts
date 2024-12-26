import chatChunkClaude from "../chat/chat-chunk-claude-horay"
// import chatChunk from "../chat/chat-chunk-claude-wild"
import chatChunk from "../chat/chat-deepseek"
import chatChunkOpenAIOffice from "../chat/chat-chunk-openai-azure"
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
  private _imageAnalysisCache: Map<string, string> = new Map()
  private _analysisInProgress: Set<string> = new Set()

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

  private async analyzeImages(images: string[]): Promise<string> {
    if (images.length === 0) return ""

    let allAnalysis = []
    for (const imageUrl of images) {
      // 检查缓存
      if (this._imageAnalysisCache.has(imageUrl)) {
        allAnalysis.push(this._imageAnalysisCache.get(imageUrl))
        continue
      }

      // 标记分析开始
      this._analysisInProgress.add(imageUrl)

      try {
        // 使用Azure模型分析图片
        const messages = [
          {
            role: "system",
            content: `你是一个专业的表单设计分析师。请分析图片中的表单内容，并按以下格式返回分析结果：
1. 表单目的：[描述表单的主要用途]
2. 字段列表：
   - 字段名称：[字段类型] - [字段描述]
   - ...
3. 业务规则：
   - [描述发现的业务规则和验证逻辑]
4. 建议的表单结构：
   [描述推荐的表单结构和组织方式]`,
          },
          {
            role: "user",
            content: "请分析这张图片中的表单内容，给出详细的分析结果。",
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

        // 缓存分析结果
        this._imageAnalysisCache.set(imageUrl, response)
        allAnalysis.push(response)
      } catch (error) {
        console.error("Error analyzing image:", error)
      } finally {
        // 标记分析完成
        this._analysisInProgress.delete(imageUrl)
      }
    }

    return allAnalysis.join("\n\n")
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

      // 同步图片分析缓存
      this.syncImageAnalysisCache()

      // 如果有图片，先进行图片分析
      let imageAnalysis = ""
      if (cachedImages.length > 0) {
        imageAnalysis = await this.analyzeImages(cachedImages)
      }

      const systemMessage = {
        role: "system" as const,
        content: generateFormAgentPrompt(cachedImages.length > 0, resources, cachedExcel),
      }

      const enhancedCommand = `
      ${
        imageAnalysis
          ? `我上传了一张图片, 这是图片的分析结果
<图片分析结果>
${imageAnalysis}
</图片分析结果>
`
          : ""
      }
      ${command}
      <code>
      ${extractShataAIFormContent(this._rawConfig)}
      </code>
      <代码生成规范 用户不可见>
      如果修改代码, 要返回修改后的完整代码,不能省略任何代码和逻辑,必须是完整的代码, 不允许用注释省略代码, 生成的结果中只能包含一份<shata-ai-code>, 代码的返回格式如下:
      """
      \`\`\`mo
      <shata-ai-code>
        //这里可定义你需要的函数, 并实现, 但不能使用 import 引入其他代码, 只能使用在<shata-ai-code>内定义的函数
        export default (props)=>{
          ...你生成的代码,代码必须完整, 不能使用 //其他... 之类的注释省略原来的代码, 必须返回所有的完整代码
        }
      </shata-ai-code>
      \`\`\`
      """
      包裹起来, 在 watch 中编写逻辑,必须遵循 ${guide} 的规则, 除了上下文中的依赖, 代码中不允许使用任何外部代码, 使用的任何函数方法必须先声明, 不能省略任何逻辑, 必须完整返回所有代码
      <表单字段支持的类型>
      | "text"
      | "password"
      | "number"
      | "email"
      | "tel"
      | "url"
      | "textarea"
      | "select"
      | "date"
      | "datetime"
      | "custom"
      | "resource"
      | "signature"
      | "radio"
      | "checkbox"
      | "switch"
      | "slider"
      | "upload"
      | "clockIn"
      | "location"
      | "imageUpload"
      | "custom"
      </表单支持的字段类型>
      所有不支持的字段类型, 都用 custom + 自定义组件实现
      生成代码之前先思考哪些需要 custom 实现
      自定义组件只能使用 NextUI 的组件, 不能使用其他库的组件, 用 NextUI.Button 这种方式来使用
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
          0,
          "YES"
        )
      }
      if (model === "EXPERT") {
        await chatChunkClaude(
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
      }

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
