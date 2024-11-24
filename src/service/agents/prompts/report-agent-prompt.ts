import { logger } from "@/utils/logger"
import { mapVisualizationGuide } from "./map-visualization-guide"

// 基础提示词部分
const basePrompt = `你是一个智能报表分析助手，负责帮助用户对数据进行分析。
请仔细分析用户的需求，生成相应的分析代码。`

// 数据访问示例
const dataAccessExamples = `
数据结构说明:
interface AnalysisData {
  groups: {
    [templateId: string]: {
      id: string
      title: string
      data: any[]
    }
  }
  metadata: {
    templateInfoMap: Record<string, string>
    columns: any[]
  }
}

数据访问示例:

1. ❌ 错误的访问方式:
return {
  type: 'analyze',
  data: data,
  analysis: {
    summary: {
      total: {
        value: data.length,  // ❌ 错误：data 不是数组
        label: '总数'
      }
    },
    charts: [{
      data: data.map(item => ({  // ❌ 错误：data 不是数组
        name: item.name,
        value: item.value
      }))
    }]
  }
};

2. ✅ 正确的访问方式:
return {
  type: 'analyze',
  data: data,
  analysis: {
    // 1. 设置数据源信息
    sources: Object.entries(data.groups).reduce((acc, [templateId, group]) => {
      acc[templateId] = {
        id: group.id,
        title: group.title
      }
      return acc
    }, {}),

    // 2. 访问单个数据源
    summary: (() => {
      const firstGroupId = Object.keys(data.groups)[0]
      const firstGroup = data.groups[firstGroupId]
      const items = firstGroup.data  // ✅ 正确：通过 groups 访问数据

      return {
        total: {
          value: items.length,
          label: '总数',
          sourceId: firstGroup.id,
          sourceTitle: firstGroup.title
        }
      }
    })(),

    // 3. 处理多个数据源的图表
    charts: Object.entries(data.groups).map(([templateId, group]) => ({
      type: 'pie',
      title: \`\${group.title} 分布\`,
      data: group.data.map(item => ({
        name: item.name,
        value: item.value,
        sourceId: group.id,
        sourceTitle: group.title
      }))
    })),

    // 4. 生成跨数据源的洞察
    insights: [{
      content: \`共分析了 \${Object.keys(data.groups).length} 个数据源，
              总数据量 \${Object.values(data.groups)
                .reduce((sum, group) => sum + group.data.length, 0)} 条\`,
      sourceIds: Object.keys(data.groups)
    }]
  }
};

常见分析模式:

1. 单数据源完整分析:
const firstGroupId = Object.keys(data.groups)[0]
const firstGroup = data.groups[firstGroupId]
const items = firstGroup.data

return {
  type: 'analyze',
  data: data,
  analysis: {
    sources: {
      [firstGroup.id]: {
        id: firstGroup.id,
        title: firstGroup.title
      }
    },
    summary: {
      total: {
        value: items.length,
        label: '总数',
        sourceId: firstGroup.id,
        sourceTitle: firstGroup.title
      }
    },
    charts: [{
      type: 'pie',
      title: '数据分布',
      data: items.map(item => ({
        name: item.name,
        value: item.value,
        sourceId: firstGroup.id,
        sourceTitle: firstGroup.title
      }))
    }],
    insights: [{
      content: \`分析结果...\`,
      sourceIds: [firstGroup.id]
    }]
  }
}

2. 多数据源汇总分析:
const allGroups = Object.entries(data.groups)
const totalCount = allGroups.reduce((sum, [_, group]) => sum + group.data.length, 0)

return {
  type: 'analyze',
  data: data,
  analysis: {
    sources: allGroups.reduce((acc, [id, group]) => {
      acc[id] = { id: group.id, title: group.title }
      return acc
    }, {}),
    summary: {
      total: {
        value: totalCount,
        label: '总数据量',
        sourceId: 'all',
        sourceTitle: '所有数据源'
      }
    },
    charts: allGroups.map(([_, group]) => ({
      type: 'pie',
      title: \`\${group.title} 分布\`,
      data: group.data.map(item => ({
        name: item.name,
        value: item.value,
        sourceId: group.id,
        sourceTitle: group.title
      }))
    })),
    insights: [{
      content: \`共分析 \${allGroups.length} 个数据源，总数据量 \${totalCount} 条\`,
      sourceIds: allGroups.map(([id]) => id)
    }]
  }
}

3. 地理数据分析:
const firstGroup = data.groups[Object.keys(data.groups)[0]]
const locations = firstGroup.data

return {
  type: 'analyze',
  data: data,
  analysis: {
    sources: {
      [firstGroup.id]: {
        id: firstGroup.id,
        title: firstGroup.title
      }
    },
    summary: {
      total: {
        value: locations.length,
        label: '位置总数',
        sourceId: firstGroup.id,
        sourceTitle: firstGroup.title
      }
    },
    charts: [{
      type: 'map',
      title: '地理分布',
      data: locations.map(item => ({
        name: item.name,
        address: item.address,
        value: item.value,
        sourceId: firstGroup.id,
        sourceTitle: firstGroup.title
      })),
      options: {
        center: [120.19, 30.26],
        zoom: 12
      },
      tooltip: {
        fields: [
          { key: 'name', label: '名称' },
          { key: 'address', label: '地址' },
          { key: 'value', label: '数值' }
        ]
      }
    }],
    insights: [{
      content: \`地理分布分析结果...\`,
      sourceIds: [firstGroup.id]
    }]
  }
}

注意事项:
1. 必须通过 data.groups 访问数据
2. 每个统计项都要包含 sourceId 和 sourceTitle
3. 使用 Object.keys(data.groups) 获取所有数据源ID
4. 使用 Object.values(data.groups) 获取所有数据源组
5. 图表数据必须包含数据源信息
6. 洞察信息必须关联数据源ID
7. 不要直接访问 data[0] 或 data.length
8. 使用 IIFE 来组织复杂的数据处理逻辑
`

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
        value: Object.values(data.groups)
          .reduce((sum, group) => sum + group.data.length, 0),
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
  return Object.entries(groups)
    .map(([templateId, items]) => {
      const firstItem = items[0]
      const structure = Object.entries(firstItem).reduce(
        (acc, [key, value]) => {
          acc[key] = typeof value
          return acc
        },
        {} as Record<string, string>
      )

      return `
模板 ${templateId} 的数据字段和类型:
${JSON.stringify(structure, null, 2)}
    `
    })
    .join("\n")
}

// 生成实际数据展示
function generateActualData(groups: Record<string, any[]>, templateInfoMap: Record<string, string>) {
  return Object.entries(groups)
    .map(([templateId, items]) => {
      const templateTitle = templateInfoMap[templateId] || `模板 ${templateId}`
      const actualData = items.slice(0, 10)

      return `
${templateTitle} (模板ID: ${templateId}) 的数据:
${JSON.stringify(actualData, null, 2)}
    `
    })
    .join("\n")
}

// 生成数据统计信息
function generateDataStatistics(groups: Record<string, any[]>) {
  return Object.entries(groups)
    .map(([templateId, items]) => {
      const numericColumns = Object.entries(items[0])
        .filter(([_, value]) => typeof value === "number")
        .map(([key]) => key)

      const statistics = numericColumns
        .map((column) => {
          const values = items.map((item) => item[column]).filter((v) => !isNaN(v))
          const avg = values.reduce((a, b) => a + b, 0) / values.length
          const max = Math.max(...values)
          const min = Math.min(...values)

          return `
- ${column}:
  平均值: ${avg.toFixed(2)}
  最大值: ${max}
  最小值: ${min}
      `
        })
        .join("\n")

      return `
模板 ${templateId} 数值字段统计:
${statistics}
    `
    })
    .join("\n")
}

// 生成数据源信息
function generateDataSourceInfo(data: any[], templateInfoMap: Record<string, string>): string {
  const groups = data.reduce(
    (acc, item) => {
      const templateId = item._sourceTemplateId
      if (!acc[templateId]) {
        acc[templateId] = []
      }
      acc[templateId].push(item)
      return acc
    },
    {} as Record<string, any[]>
  )

  return `
数据源概览:
${Object.entries(groups)
  .map(([templateId, items]) => `- ${templateInfoMap[templateId] || `模板 ${templateId}`} (${items.length} 条数据)`)
  .join("\n")}

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
`
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
${dataAccessExamples}
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
6. 统计结果放在 analysis 字段中
`
}

export default generateSystemPrompt