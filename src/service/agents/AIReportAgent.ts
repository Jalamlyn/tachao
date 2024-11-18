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

严格要求：
1. 所有数值必须通过数据计算得出，禁止硬编码任何数字
2. 每个统计结果都必须有对应的数据计算代码
3. 必须对数据进行验证和空值检查
4. 禁止在代码中直接写入具体的数值
5. 所有百分比、平均值、统计数据都必须通过实际数据计算

数据计算示例:
// ✅ 正确：通过数据计算得出结果
const totalCount = data.length;
const completedCount = data.filter(item => item?.status === 'completed').length;
const completionRate = \`\${((completedCount / totalCount) * 100).toFixed(2)}%\`;

// ❌ 错误：硬编码数字
const totalNodes = 5;  // 错误：不应该直接写入数字
const rate = '60%';    // 错误：不应该直接写入百分比

特别注意：
1. 流程分析(processAnalysis)的数据格式要求：
   - nodeStatus 必须使用状态描述字符串，如 '已完成'、'进行中'，不能使用数字
   - processDuration 需要包含时间描述字符串，如 '5天'、'2小时'，不能使用数字
   - approvers 需要包含审批人统计
   - processStatus 需要包含状态统计

2. 流程分析示例：
// ✅ 正确：通过数据计算
const processAnalysis = {
  summary: {
    totalProcessNodes: data.reduce((acc, item) => acc + (item?.nodes?.length || 0), 0),
    completedNodes: data.filter(item => item?.status === 'completed').length,
    completionRate: \`\${((completedCount / totalCount) * 100).toFixed(2)}%\`,
    averageProcessTime: \`\${calculateAverageTime(data)}天\`
  },
  nodeStatus: data.reduce((acc, item) => {
    if (item?.nodeName) {
      acc[item.nodeName] = item.confirmed ? '已完成' : '进行中';
    }
    return acc;
  }, {}),
  processDuration: {
    total: \`\${calculateTotalDuration(data)}天\`,
    nodesDuration: calculateNodesDuration(data)
  }
};

// ❌ 错误：硬编码结果
const wrongAnalysis = {
  summary: {
    totalProcessNodes: 5,           // 错误：直接写入数字
    completedNodes: 3,              // 错误：直接写入数字
    completionRate: '60%',          // 错误：直接写入百分比
    averageProcessTime: '2.5天'     // 错误：直接写入时间
  }
};

3. 数据转换和计算辅助函数示例：
// 计算平均处理时间
const calculateAverageTime = (data) => {
  const times = data
    .filter(item => item?.duration)
    .map(item => item.duration);
  return times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : 0;
};

// 计算节点状态
const calculateNodeStatus = (data) => {
  return data.reduce((acc, item) => {
    if (item?.nodeName) {
      acc[item.nodeName] = item.confirmed ? '已完成' : '进行中';
    }
    return acc;
  }, {});
};

// 计算处理时长
const calculateProcessDuration = (data) => {
  const totalDays = data.reduce((acc, item) => acc + (item?.duration || 0), 0);
  return {
    total: \`\${totalDays}天\`,
    nodesDuration: data.reduce((acc, item) => {
      if (item?.nodeName && item?.duration) {
        acc[item.nodeName] = \`\${item.duration}天\`;
      }
      return acc;
    }, {})
  };
};

重要提示：
1. 生成的代码必须包含数据验证和空值检查
2. 使用可选链操作符（?.）访问可能不存在的属性
3. 对于需要深层访问的对象属性，先进行存在性检查
4. 提供默认值处理异常情况

数据验证示例：
// 数据有效性检查
const isValidData = (data) => {
  return Array.isArray(data) && data.length > 0;
};

// 安全的数据访问
const safeGetValue = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((curr, key) => 
    (curr && curr[key] !== undefined) ? curr[key] : defaultValue, 
    obj
  );
};

// 数据过滤和验证
const validRecords = data.filter(item => 
  item && 
  typeof item === 'object' && 
  item?.id &&
  item?.status
);`

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
7. 所有数值必须通过数据计算得出，禁止硬编码

返回 markdown 格式示例,必须 \`\`\`mo 开头 \`\`\`结尾
\`\`\`mo
<shata-ai-code>
// 数据验证
const validData = data.filter(item => item && typeof item === 'object');
const totalCount = validData.length;

// 计算统计结果
const result = {
  type: 'analyze',
  data: data,     // 保持原始数据不变
  analysis: {     // 统计结果必须通过计算得出
    summary: {
      totalRecords: totalCount,
      validRecords: validData.length,
      completionRate: \`\${((validData.filter(item => item.completed).length / totalCount) * 100).toFixed(2)}%\`
    }
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