import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { jsonParse, jsonStringify } from "@/utils"
import DynamicFormConfigStr from "@/components/common/DynamicForm/types.str"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"

interface FormIndex {
  id: string
  templateId: string
  status: string
  title: string
}

export class AIFormAgent {
  private static instance: AIFormAgent
  private systemPrompt = `你是一个智能表单助手，负责帮助用户创建和检索表单。
创建表单时，你需要生成一个符合 DynamicFormConfig 类型的配置对象。
检索表单时，你需要根据用户的描述在表单索引中查找匹配的表单。

${DynamicFormConfigStr}
`

  private constructor() {}

  public static getInstance(): AIFormAgent {
    if (!AIFormAgent.instance) {
      AIFormAgent.instance = new AIFormAgent()
    }
    return AIFormAgent.instance
  }

  private async processAIResponse(userInput: string, onChunk: (chunk: string) => void): Promise<string> {
    let response = ""
    await chatChunkClaude(
      [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: userInput },
      ],
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

  public async createForm(
    description: string,
    onChunk: (chunk: string) => void
  ): Promise<{
    config: DynamicFormConfig
    title: string
  }> {
    const prompt = `请根据以下描述生成一个表单配置代码：
${description}

请生成包含两部分内容的 js 代码：
1. 表单标题(title)：简要概括表单的主要内容
2. 表单配置(config)：一个符合 DynamicFormConfig 类型的配置 js 对象

请使用如下格式返回：
<mo-ai-form>
return {
  title: "表单标题",
  config: {
    // 完整的表单配置对象
  }
}
</mo-ai-form>`

    try {
      const response = await this.processAIResponse(prompt, onChunk)
      const parsedConfig = await parseFormConfig(response)
      
      if (!parsedConfig) {
        throw new Error("解析表单配置失败")
      }

      // 从解析后的配置中提取 title 和 config
      const { title, config } = parsedConfig

      if (!title || !config) {
        throw new Error("表单配置缺少必要的字段")
      }

      return {
        config: config as DynamicFormConfig,
        title: title as string,
      }
    } catch (error) {
      console.error("Error creating form:", error)
      throw new Error("创建表单失败：" + (error as Error).message)
    }
  }

  public async searchForms(
    query: string,
    formsIndex: FormIndex[],
    onChunk: (chunk: string) => void
  ): Promise<FormIndex[]> {
    const prompt = `请根据用户的查询条件"${query}"，在以下表单索引中查找匹配的表单：
${jsonStringify(formsIndex)}

请返回匹配的表单数组，格式如下：
<mo-ai-result>
return [
  // 匹配的表单索引数组
]
</mo-ai-result>

注意：
1. 只返回与查询条件相关的表单
2. 如果没有匹配的表单，返回空数组
3. 返回的数组元素必须来自原始数据，不要修改或添加新字段`

    try {
      const response = await this.processAIResponse(prompt, onChunk)
      const match = response.match(/<mo-ai-result>([\s\S]*?)<\/mo-ai-result>/)

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

  public async analyzeIntent(input: string): Promise<"create" | "search"> {
    const prompt = `请分析用户输入"${input}"的意图，判断是创建表单还是检索表单。
请只返回"create"或"search"。`

    try {
      const response = await this.processAIResponse(prompt, () => {})
      return response.includes("create") ? "create" : "search"
    } catch (error) {
      console.error("Error analyzing intent:", error)
      throw new Error("分析用户意图失败：" + (error as Error).message)
    }
  }
}

export default AIFormAgent.getInstance()