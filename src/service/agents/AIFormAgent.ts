import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { jsonParse, jsonStringify } from "@/utils"
import DynamicFormConfigStr from "./DynamicFormConfigStr"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import { parseFormConfig, parseFormEditOperations } from "@/utils/codeParser"
import message from "@/components/Message"
import { set, cloneDeep } from "lodash"
import AIGenerationDialog from "@/components/AIGenerationDialog"
import { createRoot } from 'react-dom/client'
import FormPreview from "@/pages/FormManager/components/FormPreview"

interface FormIndex {
  id: string
  templateId: string
  status: string
  title: string
}

export type CommandResult = {
  type: "create" | "edit" | "search"
  data: any
  generationProcess?: string
}

export class AIFormAgent {
  private static instance: AIFormAgent
  private dialogRoot: any = null
  private dialogContainer: HTMLDivElement | null = null
  private isDialogMounted: boolean = false

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
生成必要的校验逻辑函数，用于保存的时候对表单数据进行校验
`

  private constructor() {
    // 创建对话框容器
    this.dialogContainer = document.createElement('div')
    document.body.appendChild(this.dialogContainer)
    this.dialogRoot = createRoot(this.dialogContainer)
  }

  public static getInstance(): AIFormAgent {
    if (!AIFormAgent.instance) {
      AIFormAgent.instance = new AIFormAgent()
    }
    return AIFormAgent.instance
  }

  private showGenerationDialog(isOpen: boolean, generationContent: string = "", resultProps?: any) {
    if (!this.dialogContainer || !this.dialogRoot) return

    this.dialogRoot.render(
      <AIGenerationDialog
        isOpen={isOpen}
        onClose={() => this.showGenerationDialog(false)}
        generationContent={generationContent}
        ResultComponent={resultProps ? FormPreview : undefined}
        resultProps={resultProps}
      />
    )
    this.isDialogMounted = isOpen
  }

  // 统一的命令处理入口
  public async processCommand(command: string, onChunk?: (chunk: string) => void): Promise<CommandResult> {
    let generationProcess = ""
    const updateGenerationProcess = (chunk: string) => {
      generationProcess += chunk
      onChunk?.(chunk)
      // 更新对话框内容
      if (this.isDialogMounted) {
        this.showGenerationDialog(true, generationProcess)
      }
    }

    const intent = await this.analyzeIntent(command)
    
    if (intent === "unsupported") {
      throw new Error("不支持的指令，请使用创建表单、检索表单或编辑表单相关的指令。")
    }

    // 显示生成对话框
    this.showGenerationDialog(true, "")

    // 添加动画效果的工作流展示
    updateGenerationProcess("🤖 AI助手正在分析您的需求...\n")
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      let result: CommandResult
      switch (intent) {
        case "create":
          updateGenerationProcess("📝 开始创建表单...\n")
          const createResult = await this.createForm(command, updateGenerationProcess)
          result = {
            type: "create",
            data: createResult,
            generationProcess
          }
          // 更新对话框，显示预览结果
          if (createResult) {
            this.showGenerationDialog(true, generationProcess, { config: createResult.config })
          }
          return result

        case "edit":
          updateGenerationProcess("✏️ 开始编辑表单...\n")
          const editResult = await this.editForm(null as any, command, updateGenerationProcess)
          result = {
            type: "edit",
            data: editResult,
            generationProcess
          }
          // 更新对话框，显示预览结果
          if (editResult) {
            this.showGenerationDialog(true, generationProcess, { config: editResult.config })
          }
          return result

        case "search":
          updateGenerationProcess("🔍 开始搜索表单...\n")
          const searchResult = await this.searchForms(command, [], updateGenerationProcess)
          result = {
            type: "search",
            data: searchResult,
            generationProcess
          }
          return result

        default:
          throw new Error("未知的指令类型")
      }
    } catch (error) {
      // 发生错误时关闭对话框
      this.showGenerationDialog(false)
      throw error
    }
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

  public async analyzeIntent(input: string): Promise<"create" | "search" | "edit" | "unsupported"> {
    const aiAnalysisPrompt = `请分析以下用户指令的意图，判断是否是合法的表单操作指令：
"${input}"

请根据以下规则进行分析：
1. 如果是创建/新建/生成表单的指令，返回 "create"
2. 如果是搜索/查找/检索表单或资料的指令，返回 "search"
3. 如果是编辑/修改/更新表单的指令，返回 "edit"
4. 如果不是表单相关的指令或指令不明确，返回 "unsupported"

请只返回 "create"、"search"、"edit" 或 "unsupported"，不要返回其他内容。`

    try {
      const aiResponse = await this.processAIResponse(aiAnalysisPrompt, () => {})
      const cleanResponse = aiResponse.trim().toLowerCase()

      if (
        cleanResponse === "create" ||
        cleanResponse === "search" ||
        cleanResponse === "edit" ||
        cleanResponse === "unsupported"
      ) {
        if (cleanResponse === "unsupported") {
          message.warning("不支持的指令，请使用创建表单、检索表单或编辑表单相关的指令。")
        }
        return cleanResponse as "create" | "search" | "edit" | "unsupported"
      }

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

      message.warning("不支持的指令，请使用创建表单、检索表单或编辑表单相关的指令。")
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
    await new Promise(resolve => setTimeout(resolve, 300))

    const prompt = `请根据以下描述生成一个表单配置代码：
${description}

请生成包含两部分内容的 js 代码：
1. 表单标题(title)：简要概括表单的主要内容
2. 表单配置(config)：一个符合 DynamicFormConfig 类型的配置 js 对象

请使用如下格式返回：
<mo-ai-form>
export default {
  // 完整的表单配置对象
}
</mo-ai-form>`

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

  private async editForm(
    currentConfig: DynamicFormConfig,
    editDescription: string,
    onChunk: (chunk: string) => void
  ): Promise<{
    config: DynamicFormConfig
    title?: string
  } | null> {
    onChunk("🔄 正在分析编辑需求...\n")
    await new Promise(resolve => setTimeout(resolve, 300))

    const prompt = `请根据以下编辑描述,生成精确的表单配置修改代码:

当前表单配置:
${jsonStringify(currentConfig)}

编辑需求:
${editDescription}

请生成使用 lodash 的 set 函数的修改代码,使用如下格式:
<mo-ai-edit>
// 使用 set(config, path, value) 进行精确修改
set(config, 'formFields.basicInfo[0].label', '新的标签');
set(config, 'formFields.basicInfo[0].required', true);
// 如果需要修改标题
config.title = "新的标题";
</mo-ai-edit>

注意:
1. 只生成需要修改的部分
2. 使用精确的对象路径
3. 每个修改使用单独的 set 语句
4. 确保路径正确且存在`

    try {
      onChunk("🛠️ 正在应用修改...\n")
      const response = await this.processAIResponse(prompt, onChunk)
      const editOperation = await parseFormEditOperations(response)
      const newConfig = cloneDeep(currentConfig)
      editOperation(newConfig, set)

      onChunk("✅ 表单修改完成！\n")
      return {
        config: newConfig,
        title: newConfig.title,
      }
    } catch (error) {
      console.error("Error editing form:", error)
      throw new Error("编辑表单失败：" + (error as Error).message)
    }
  }

  private async searchForms(
    query: string,
    formsIndex: FormIndex[],
    onChunk: (chunk: string) => void
  ): Promise<FormIndex[]> {
    onChunk("🔍 正在搜索匹配的表单...\n")
    await new Promise(resolve => setTimeout(resolve, 300))

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

  // 清理方法
  public cleanup() {
    if (this.dialogContainer) {
      document.body.removeChild(this.dialogContainer)
      this.dialogContainer = null
      this.dialogRoot = null
      this.isDialogMounted = false
    }
  }
}

export default AIFormAgent.getInstance()