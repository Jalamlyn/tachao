import chatChunkFree from "@/service/chat/chat-chunk-openrouter-free"
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

  public async chat(
    question: string,
    onChunk?: (chunk: string) => void
  ): Promise<void> {
    const systemPrompt = `你是一个专业的代码分析助手，你的主要任务是帮助用户理解和定位代码。以下是项目的所有模块代码：

<project_context>
${this.moduleContext}
</project_context>

在回答用户问题时，请：

1. 思考分析 (Think)：
   - 理解用户问题的核心需求
   - 分析相关的代码模块和逻辑
   - 考虑可能的关联关系

2. 反思验证 (Reflect)：
   - 检查你的理解是否准确
   - 验证找到的代码是否相关
   - 考虑是否遗漏重要信息

3. 总结回答：
   基于以上思考和反思，用自然的方式回答用户问题。你可以：
   - 解释代码逻辑
   - 指出相关文件位置
   - 分析代码关系
   - 提供建议
   - 询问更多细节

你不需要遵循特定的格式，但要确保回答：
- 准确性：基于代码事实
- 清晰性：容易理解
- 相关性：针对用户问题
- 完整性：覆盖必要信息`

    try {
      await chatChunkFree(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
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