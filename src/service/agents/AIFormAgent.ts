import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { jsonParse, jsonStringify } from "@/utils"
import DynamicFormConfigStr from "./DynamicFormConfigStr"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig } from "@/utils/codeParser"
import message from "@/components/Message"

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
不要生成 订单编号 的配置，系统会自动生成。
生成的表单必须包含3个部分
- 基本信息
- 明细信息
- 流程信息
生成明细信息如果涉及到计算的，要生成正确的行计算和合计计算逻辑
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

  private async validateIntent(action: string, input: string): Promise<boolean> {
    const intent = await this.analyzeIntent(input)
    if (intent === "unsupported") {
      return false
    }
    if (intent !== action) {
      message.error(`当前操作需要 ${action} 类型的指令，但收到的是 ${intent} 类型的指令`)
      return false
    }
    return true
  }

  public async createForm(
    description: string,
    onChunk: (chunk: string) => void
  ): Promise<{
    config: DynamicFormConfig
    title: string
  } | null> {
    // 验证意图
    const isValid = await this.validateIntent("create", description)
    if (!isValid) {
      return null
    }

    const prompt = `请根据以下描述生成一个表单配置代码：
${description}

请生成包含两部分内容的 js 代码：
1. 表单标题(title)：简要概括表单的主要内容
2. 表单配置(config)：一个符合 DynamicFormConfig 类型的配置 js 对象

请使用如下格式返回：
<mo-ai-form>
export default {
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

  public async editForm(
    currentConfig: DynamicFormConfig,
    editDescription: string,
    onChunk: (chunk: string) => void
  ): Promise<{
    config: Partial<DynamicFormConfig>
    title?: string
  } | null> {
    // 验证意图
    const isValid = await this.validateIntent("edit", editDescription)
    if (!isValid) {
      return null
    }

    const prompt = `请根据以下编辑描述，修改现有的表单配置：

当前表单配置:
${jsonStringify(currentConfig)}

编辑需求:
${editDescription}

请只返回需要修改的部分配置，使用如下格式：
<mo-ai-form>
export default {
  title: "新的表单标题(如果需要修改)",
  config: {
    // 只包含需要修改的配置部分
  }
}
</mo-ai-form>

注意:
1. 只返回需要修改的部分
2. 保持与原配置的结构一致
3. 确保修改符合 DynamicFormConfig 类型定义`

    try {
      const response = await this.processAIResponse(prompt, onChunk)
      const parsedConfig = await parseFormConfig(response)

      if (!parsedConfig) {
        throw new Error("解析表单配置失败")
      }

      const { title, config } = parsedConfig

      if (!config) {
        throw new Error("表单配置缺少必要的字段")
      }

      return {
        config: config as Partial<DynamicFormConfig>,
        title: title,
      }
    } catch (error) {
      console.error("Error editing form:", error)
      throw new Error("编辑表单失败：" + (error as Error).message)
    }
  }

  public async searchForms(
    query: string,
    formsIndex: FormIndex[],
    onChunk: (chunk: string) => void
  ): Promise<FormIndex[]> {
    // 验证意图
    const isValid = await this.validateIntent("search", query)
    if (!isValid) {
      return []
    }

    const prompt = `请根据用户的查询条件"${query}"，在以下表单索引中查找匹配的表单：
${jsonStringify(formsIndex)}

请返回匹配的表单数组，格式如下：
<mo-ai-result>
export default getMatchedForms() {
  return [
    // 匹配的表单索引数组
  ]
}
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

  public async analyzeIntent(input: string): Promise<"create" | "search" | "edit" | "unsupported"> {
    // 使用 AI 分析指令
    const aiAnalysisPrompt = `请分析以下用户指令的意图，判断是否是合法的表单操作指令：
"${input}"

请根据以下规则进行分析：
1. 如果是创建/新建/生成表单的指令，返回 "create"
2. 如果是搜索/查找/检索表单或资料的指令，返回 "search"
3. 如果是编辑/修改/更新表单的指令，返回 "edit"
4. 如果不是表单相关的指令或指令不明确，返回 "unsupported"

请只返回 "create"、"search"、"edit" 或 "unsupported"，不要返回其他内容。`

    try {
      // 先尝试使用 AI 分析
      const aiResponse = await this.processAIResponse(aiAnalysisPrompt, () => {})
      const cleanResponse = aiResponse.trim().toLowerCase()

      if (cleanResponse === "create" || cleanResponse === "search" || cleanResponse === "edit" || cleanResponse === "unsupported") {
        if (cleanResponse === "unsupported") {
          message.warning("不支持的指令，请使用创建表单、检索表单或编辑表单相关的指令。")
        }
        return cleanResponse as "create" | "search" | "edit" | "unsupported"
      }

      // 如果 AI 分析失败，使用原有的关键词匹配作为备选方案
      const createKeywords = /(创建|新建|生成|制作|添加|建立).*?(表单|单据|模板)/
      if (createKeywords.test(input)) {
        return "create"
      }

      const searchKeywords = /(搜索|查找|检索|查询|寻找|浏览).*?(表单|单据|资料|模板)/
      if (searchKeywords.test(input)) {
        return "search"
      }

      const editKeywords = /(编辑|修改|更新|调整|改变).*?(表单|单据|模板)/
      if (editKeywords.test(input)) {
        return "edit"
      }

      // 如果都不匹配，返回不支持的指令
      message.warning("不支持的指令，请使用创建表单、检索表单或编辑表单相关的指令。")
      return "unsupported"
    } catch (error) {
      console.error("Error analyzing intent:", error)
      message.error("分析用户意图失败：" + (error as Error).message)
      return "unsupported"
    }
  }
}

export default AIFormAgent.getInstance()