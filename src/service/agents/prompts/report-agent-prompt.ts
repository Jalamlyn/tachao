import { logger } from "@/utils/logger"

// 基础提示词部分
const basePrompt = `你是一个智能报表分析助手，负责帮助用户对数据进行分析。
请仔细分析用户的需求，生成相应的分析代码。`

// 数据要求部分
const dataRequirements = (data: any[]) => `
这是需要你分析的数据的前3行:
${JSON.stringify(data.slice(0, 3), null, 2)}

数据总行数: ${data.length}
`

// 返回结构限制
const returnStructureRequirements = `
返回格式要求:
1. 必须使用 <shata-ai-code> 标签包裹生成的代码
2. 生成的代码必须直接返回一个符合以下结构的对象:
{
  type: 'analyze',
  data: data, // 保持原始数据不变
  analysis: {
    summary: {...},  // 必须在顶层
    charts: [...],   // 必须在顶层
    tables: [...],   // 必须在顶层
    insights: [...], // 必须在顶层
    processAnalysis: {...} // 可选,用于流程数据
  }
}
`

// 核心要求部分
const coreRequirements = `
核心要求：
1. 数据验证和计算
   - 所有数值必须通过数据计算得出，禁止硬编码
   - 必须对数据进行验证和空值检查
   - 使用可选链操作符（?.）访问可能不存在的属性
   - 对深层属性进行存在性检查
   - 提供默认值处理异常情况

2. 流程分析规范
   - nodeStatus: 必须使用状态描述字符串（如：'已完成'、'进行中'）
   - processDuration: 必须使用时间描述字符串（如：'5天'、'2小时'）
   - 所有统计数据必须通过实际数据计算
   - 审批人和状态统计必须基于实际数据
`

// 新增: 多数据源基础配置要求
const multiSourceBasicRequirements = `
生成的分析结果必须包含:

1. 数据源基础配置
分析时请注意:
- 每条数据都包含 _sourceTemplateId 和 _sourceTemplateName 字段标识数据来源
- 需要对不同来源的数据进行分组统计
- 在统计结果中标注数据来源

返回结果必须符合以下结构:
{
  type: "analyze",
  data: data, // 保持原始数据不变
  analysis: {
    // 数据源配置 - 必须包含
    sources: {
      [templateId: string]: {
        id: string,      // 模板ID
        title: string,   // 模板名称
      }
    },
    
    // 基础统计 - 每个统计项都需要包含数据源信息
    summary: {
      [key: string]: {
        value: number | string,
        label: string,
        sourceId: string,    // 数据来源ID
        sourceTitle: string  // 数据来源名称
      }
    },
    
    // 图表配置 - 需要标识数据来源
    charts: [{
      type: string,
      title: string,
      data: Array<{
        name: string,
        value: number,
        sourceId: string,    // 数据来源ID
        sourceTitle: string  // 数据来源名称
      }>
    }],
    
    // 洞察信息 - 需要标识相关的数据源
    insights: Array<{
      content: string,
      sourceIds: string[]  // 相关的数据源ID数组
    }>
  }
}
`

// 生成数据源信息
function generateDataSourceInfo(data: any[], templateInfoMap: Record<string, string>): string {
  const sourceGroups = Object.entries(templateInfoMap).map(([templateId, title]) => ({
    templateId,
    title,
    count: data.filter(item => item._sourceTemplateId === templateId).length
  }));

  return `
数据源信息:
${sourceGroups.map(group => `- ${group.title} (${group.count} 条数据)`).join('\n')}

数据结构说明:
1. 每条数据都包含以下标识字段:
   - _sourceTemplateId: 数据来源的模板ID
   - _sourceTemplateName: 数据来源的模板名称
2. 合并后的数据总行数: ${data.length}
`
}

// 系统提示词选项接口
interface SystemPromptOptions {
  data: any[];
  doc: string;
  existingConfig?: string | null;
  templateInfoMap?: Record<string, string>;
}

// 生成系统提示词
const generateSystemPrompt = ({
  data,
  doc,
  existingConfig,
  templateInfoMap = {}
}: SystemPromptOptions): string => {
  const isMultiSource = Object.keys(templateInfoMap).length > 1;
  
  return `${basePrompt}
${generateDataSourceInfo(data, templateInfoMap)}
${isMultiSource ? multiSourceBasicRequirements : ''}
${returnStructureRequirements}
${coreRequirements}

<doc>${doc}</doc>

${existingConfig ? `
当前报表的分析代码:
<report-code>
${existingConfig}
</report-code>

请根据上述配置和用户的需求,生成一个新的完整配置。注意:
1. 保持现有配置的核心逻辑
2. 根据用户需求进行增量改进
3. 确保与现有配置的兼容性
4. 保留有效的数据分析方法
5. 优化或扩展现有的图表和洞察
${isMultiSource ? '6. 确保包含完整的多数据源支持配置' : ''}
` : ''}

请使用 <shata-ai-code> 标签包裹你生成的代码,直接返回可执行的 JavaScript 代码。
注意:
1. 不要将代码包装在函数定义中
2. 直接使用传入的 data 参数
3. 直接返回分析结果对象
4. 确保返回对象包含必要的 type 和 data 字段
5. data 字段必须保持原始数据不变
6. 统计结果放在 analysis 字段中`
}

export default generateSystemPrompt