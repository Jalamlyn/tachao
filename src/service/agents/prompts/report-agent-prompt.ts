import { logger } from "@/utils/logger"
import { mapVisualizationGuide } from "./map-visualization-guide"

// 基础提示词部分
const basePrompt = `你是一个智能报表分析助手，负责帮助用户对数据进行分析。
请仔细分析用户的需求，生成相应的分析代码。`

// 返回结构限制
const returnStructureRequirements = `
返回格式要求:
1. 必须使用 <shata-ai-code> 标签包裹生成的代码
2. 生成的代码必须以 return 语句开头,返回一个完整的对象
3. 返回的对象必须符合以下结构:

return {
  type: 'analyze',
  data: data, // 保持原始数据不变
  analysis: {
    summary: {...},  // 必须在顶层
    charts: [...],   // 必须在顶层
    tables: [...],   // 必须在顶层
    insights: [...], // 必须在顶层
    processAnalysis: {...} // 可选,用于流程数据
  }
};

示例代码:
<shata-ai-code>
return {
  type: 'analyze',
  data: data,
  analysis: {
    summary: {
      totalCount: {
        value: data?.length || 0,
        label: '总数量'
      }
    },
    charts: [{
      type: 'pie',
      title: '分布统计',
      data: []
    }],
    insights: ['数据分析见解']
  }
};
</shata-ai-code>

注意:
- 代码必须以 return 开头
- 不要省略 return 语句
- 确保代码可以在 Function 构造函数中执行
- 保持与现有代码的兼容性
- 不要删除或修改现有功能
`

// 数据源基础配置要求
const dataSourceRequirements = `
生成的分析结果必须包含:

1. 数据源基础配置
分析时请注意:
- 每条数据都包含 _sourceTemplateId 和 _sourceTemplateName 字段标识数据来源
- 数据按模板ID分组存储在 data.groups 中
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

// 生成数据结构描述
function generateDataStructureDescription(groups: Record<string, any[]>) {
  return Object.entries(groups).map(([templateId, items]) => {
    const firstItem = items[0];
    const structure = Object.entries(firstItem).reduce((acc, [key, value]) => {
      acc[key] = typeof value;
      return acc;
    }, {} as Record<string, string>);
    
    return `
模板 ${templateId} 的数据字段和类型:
${JSON.stringify(structure, null, 2)}
    `;
  }).join('\n');
}

// 生成实际数据展示
function generateActualData(groups: Record<string, any[]>, templateInfoMap: Record<string, string>) {
  return Object.entries(groups).map(([templateId, items]) => {
    const templateTitle = templateInfoMap[templateId] || `模板 ${templateId}`;
    const actualData = items.slice(0, 10);
    
    return `
${templateTitle} (模板ID: ${templateId}) 的数据:
${JSON.stringify(actualData, null, 2)}
    `;
  }).join('\n');
}

// 生成数据统计信息
function generateDataStatistics(groups: Record<string, any[]>) {
  return Object.entries(groups).map(([templateId, items]) => {
    const numericColumns = Object.entries(items[0]).filter(([_, value]) => 
      typeof value === 'number'
    ).map(([key]) => key);

    const statistics = numericColumns.map(column => {
      const values = items.map(item => item[column]).filter(v => !isNaN(v));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      return `
- ${column}:
  平均值: ${avg.toFixed(2)}
  最大值: ${max}
  最小值: ${min}
      `;
    }).join('\n');

    return `
模板 ${templateId} 数值字段统计:
${statistics}
    `;
  }).join('\n');
}

// 生成数据源信息
function generateDataSourceInfo(data: any[], templateInfoMap: Record<string, string>): string {
  const groups = data.reduce((acc, item) => {
    const templateId = item._sourceTemplateId;
    if (!acc[templateId]) {
      acc[templateId] = [];
    }
    acc[templateId].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return `
数据源概览:
${Object.entries(groups).map(([templateId, items]) => 
  `- ${templateInfoMap[templateId] || `模板 ${templateId}`} (${items.length} 条数据)`
).join('\n')}

数据结构说明:
${generateDataStructureDescription(groups)}

数据统计信息:
${generateDataStatistics(groups)}

实际数据:
${generateActualData(groups, templateInfoMap)}

数据访问说明:
1. 获取特定模板的数据:
   data.groups[templateId].data

2. 获取模板信息:
   data.groups[templateId].title

3. 获取所有模板ID:
   Object.keys(data.groups)

4. 数据字段说明:
   - _sourceTemplateId: string (数据来源模板ID)
   - _sourceTemplateName: string (数据来源模板名称)
   其他字段类型请参考上方数据结构说明
`;
}

// 系统提示词选项接口
interface SystemPromptOptions {
  data: any[]
  doc: string
  existingConfig?: string | null
  templateInfoMap?: Record<string, string>
}

// 生成系统提示词
const generateSystemPrompt = ({ data, doc, existingConfig, templateInfoMap = {} }: SystemPromptOptions): string => {
  return `${basePrompt}
${generateDataSourceInfo(data, templateInfoMap)}
${dataSourceRequirements}
${returnStructureRequirements}
${mapVisualizationGuide}

<doc>${doc}</doc>

${
  existingConfig
    ? `
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
6. 确保包含完整的数据源支持配置
`
    : ""
}

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