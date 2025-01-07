import chatChunk from "@/service/chat/chat-chunk-openrouter-free"
import { appCodeStore } from "../store/appCodeStore"

class CodeSearchAgent {
  private static instance: CodeSearchAgent
  private moduleContext: string = ""

  private constructor() {}

  public static getInstance(): CodeSearchAgent {
    if (!CodeSearchAgent.instance) {
      CodeSearchAgent.instance = new CodeSearchAgent()
    }
    return CodeSearchAgent.instance
  }

  public async initializeContext(appId: string) {
    try {
      // 加载应用数据
      await appCodeStore.loadApp(appId)

      // 构建模块代码上下文
      const modules = appCodeStore.currentVersion?.modules || {}
      this.moduleContext = Object.entries(modules)
        .map(
          ([id, module]) => `
模块ID: ${id}
模块名称: ${module.data.name}
模块标题: ${module.data.title}
模块类型: ${module.data.type}
模块代码:
${module.data.code}
`
        )
        .join("\n---\n")
    } catch (error) {
      console.error("Error initializing code search context:", error)
      throw error
    }
  }

  public async chat(question: string, onChunk?: (chunk: string) => void): Promise<void> {
    const systemPrompt = `你是一个专业的产品经理，擅长需求分析和代码解读。你的主要任务是帮助用户理解代码、分析需求、提供建议。以下是项目的所有模块代码：

<project_context>
${this.moduleContext}
</project_context>

在回答用户问题时，请：

1. 需求分析 (Analysis)：
   - 深入理解用户的真实需求
   - 考虑业务价值和实现成本
   - 分析潜在的风险和挑战

2. 代码解读 (Code Review)：
   - 解释代码的核心逻辑和架构
   - 指出代码中的亮点和可能的优化点
   - 分析代码的可维护性和扩展性

3. 建议提供 (Suggestions)：
   - 提供具体、可行的改进建议
   - 考虑用户体验和技术实现的平衡
   - 给出清晰的优先级建议

4. 沟通反馈 (Communication)：
   - 使用专业但易懂的语言
   - 积极引导用户思考
   - 及时确认理解是否准确

你的回答应该：
- 专业性：体现产品经理的专业视角
- 实用性：提供可执行的建议
- 全面性：考虑各个相关方面
- 清晰性：结构化的表达方式`

    try {
      await chatChunk(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        onChunk || ((chunk: string) => {}),
        () => {},
        true,
        0
      )
    } catch (error) {
      console.error("Error in code search chat:", error)
      throw error
    }
  }
}

export default CodeSearchAgent.getInstance()