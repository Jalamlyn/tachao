import chatChunkClaude from "../chat/chat-chunk-claude-office"
import { Message } from "./AIFormAgentTypes"
import { formulaService } from "@/services/formulaService"
import { markdown as doc } from "@/pages/report-management/components/AnalysisResult.md"

export type ReportColumn = {
  header: string
  accessorKey: string
}

interface AnalysisResult {
  type: "analyze"
  data: any[]
  analysis: {
    summary: Record<string, number | string>
    charts?: {
      type: string
      data: {
        labels: string[]
        values: number[]
      }
    }[]
    insights: string[]
    processAnalysis?: {
      summary?: {
        totalProcessNodes: number
        completedNodes: number
        completionRate: string
        averageProcessTime: string
      }
      nodeStatus?: Record<string, string>
      processDuration?: {
        total: string
        nodesDuration: Record<string, string>
      }
      approvers?: Record<string, number>
      processStatus?: Record<string, number>
    }
  }
}

type ResourceOperationResult = AnalysisResult

interface ProcessCommandOptions {
  data: any[]
  command: string
  onChunk?: (chunk: string) => void
}

export class AIReportAgent {
  private static instance: AIReportAgent
  private _data: any[] = []

  private constructor() {
    console.log("[AIReportAgent] Instance created")
  }

  public static getInstance(): AIReportAgent {
    if (!AIReportAgent.instance) {
      AIReportAgent.instance = new AIReportAgent()
      console.log("[AIReportAgent] New instance created")
    }
    return AIReportAgent.instance
  }

  public setData(data: any[]): void {
    console.log("[AIReportAgent] Setting data, length:", data?.length)
    this._data = data
  }

  private generateSystemPrompt(data: any[]): string {
    console.log("[AIReportAgent] Generating system prompt")
    const basePrompt = `你是一个智能报表分析助手，负责帮助用户对数据进行分析。
请仔细分析用户的需求，生成相应的分析代码。

数据示例:
${JSON.stringify(data.slice(0, 3), null, 2)}

数据总行数: ${data.length}

特别注意：
1. 流程分析(processAnalysis)的数据格式要求：
   - nodeStatus 必须使用状态描述字符串，如 '已完成'、'进行中'，不能使用数字
   - processDuration 需要包含时间描述字符串，如 '5天'、'2小时'，不能使用数字
   - approvers 需要包含审批人统计
   - processStatus 需要包含状态统计

2. 流程分析示例：
processAnalysis: {
  summary: {
    totalProcessNodes: 5,
    completedNodes: 3,
    completionRate: '60%',
    averageProcessTime: '2.5天'  // 必须是时间描述字符串
  },
  nodeStatus: {
    '节点1': '已完成',    // ✅ 正确：使用状态描述字符串
    '节点2': '进行中'     // ✅ 正确：使用状态描述字符串
    // ❌ 错误：'节点3': 5  // 不要使用数字
  },
  processDuration: {
    total: '5天',         // ✅ 正确：使用时间描述字符串
    nodesDuration: {
      '节点1': '2天',     // ✅ 正确：使用时间描述字符串
      '节点2': '3天'      // ✅ 正确：使用时间描述字符串
      // ❌ 错误：'节点3': 3  // 不要使用数字
    }
  },
  approvers: {
    '审批人A': 10,
    '审批人B': 5
  },
  processStatus: {
    '已完成': 3,
    '进行中': 2
  }
}

3. 数据转换示例：
// 转换节点状态
const nodeStatus = data.reduce((acc, item) => {
  acc[item.nodeName] = item.confirmed ? '已完成' : '进行中';  // ✅ 转换为状态描述
  return acc;
}, {});

// 转换处理时长
const processDuration = {
  total: \`\${totalDays}天\`,  // ✅ 转换为时间描述
  nodesDuration: data.reduce((acc, item) => {
    acc[item.nodeName] = \`\${item.duration}天\`;  // ✅ 转换为时间描述
    return acc;
  }, {})
};

重要提示：
1. 生成的代码必须包含数据验证和空值检查
2. 使用可选链操作符（?.）访问可能不存在的属性
3. 对于需要深层访问的对象属性，先进行存在性检查
4. 提供默认值处理异常情况

代码示例：
// 辅助函数：安全访问嵌套属性
const getNestedValue = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((curr, key) => 
    (curr && curr[key] !== undefined) ? curr[key] : defaultValue, 
    obj
  );
};

// 数据验证示例
const validData = data.filter(item => item && typeof item === 'object');

// 安全的属性访问示例
const completedNodes = data.filter(item => 
  item?.processConfirmations?.basicInfo?.confirmed === true
).length;

// 使用默认值
const totalCount = data?.length || 0;
const status = item?.status || 'unknown';`

    return `${basePrompt}

<doc>${doc}</doc>
请使用 <shata-ai-code> 标签包裹你生成的代码，直接返回可执行的 JavaScript 代码。
注意:
1. 不要将代码包装在函数定义中
2. 直接使用传入的 data 参数
3. 直接返回分析结果对象
4. 确保返回对象包含必要的 type 和 data 字段
5. data 字段必须保持原始数据不变
6. 统计结果放在 analysis 字段中

返回 markdown 格式示例,必须 \`\`\`mo 开头 \`\`\`结尾
\`\`\`mo
<shata-ai-code>
// 直接处理数据,使用传入的 data 参数
const result = {
  type: 'analyze',
  data: data,     // 保持原始数据不变
  analysis: {     // 统计结果放在这里, 不要出现英文标签
    summary: {...},
    charts: [...],
    insights: [...]
  }
};
return result;
</shata-ai-code>
\`\`\`
- 开头和结尾都不要做解释和说明`
  }

  private async executeCode(code: string, data: any[]): Promise<any> {
    try {
      console.log("[AIReportAgent] Executing analysis code")
      const wrappedCode = `
        return (function(data, formulajs) {
          ${code}
        })(data, formulajs);
      `
      const executeFunction = new Function("data", "formulajs", wrappedCode)
      const result = executeFunction(data, formulaService)
      console.log("[AIReportAgent] Analysis completed successfully")
      return result
    } catch (error) {
      console.error("[AIReportAgent] Error executing analysis code:", error)
      throw error
    }
  }

  public async processCommand({ data, command, onChunk }: ProcessCommandOptions): Promise<{
    success: boolean
    message: string
    analysis?: AnalysisResult["analysis"]
  }> {
    console.log("[AIReportAgent] Processing analysis command:", command)

    if (!data || !data.length) {
      console.log("[AIReportAgent] Invalid data provided")
      return {
        success: false,
        message: "请提供有效的数据",
      }
    }

    try {
      const systemPrompt = this.generateSystemPrompt(data)
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: command },
      ]

      let aiResponse = ""
      await chatChunkClaude(
        messages,
        (chunk: string) => {
          aiResponse += chunk
          onChunk?.(chunk)
        },
        () => {},
        true,
        0
      )

      console.log("[AIReportAgent] AI response received")

      const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
      const match = aiResponse.match(regex)
      if (!match) {
        console.error("[AIReportAgent] No valid analysis code found in AI response")
        throw new Error("No valid analysis code found in AI response")
      }
      const generatedCode = match[1].trim()

      const result = (await this.executeCode(generatedCode, data)) as ResourceOperationResult

      if (!result || !result.type || !result.data) {
        console.error("[AIReportAgent] Invalid analysis result format")
        throw new Error("Invalid analysis result format")
      }

      console.log("[AIReportAgent] Analysis completed successfully")
      return {
        success: true,
        message: "分析完成",
        analysis: result.analysis,
      }
    } catch (error) {
      console.error("[AIReportAgent] Error processing analysis command:", error)
      return {
        success: false,
        message: "分析过程中发生错误：" + (error as Error).message,
      }
    }
  }
}

export default AIReportAgent.getInstance()