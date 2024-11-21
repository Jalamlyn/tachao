// 基础提示词部分
const basePrompt = `你是一个智能报表分析助手，负责帮助用户对数据进行分析。
请仔细分析用户的需求，生成相应的分析代码。`

// 数据要求部分
const dataRequirements = (data: any[]) => `
这是需要你分析的数据的前3行:
<data>
${JSON.stringify(data.slice(0, 3), null, 2)}
</data>

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

// 生成系统提示词
const generateSystemPrompt = (data: any[], doc: string, existingConfig?: string): string => {
  const modePrompt = existingConfig
    ? `
当前报表的分析代码:
<report-code>
${existingConfig}
</report-code>

请根据上述配置和用户的需求，生成一个新的完整配置。在更新时：
1. 保持现有配置的核心逻辑
2. 根据用户需求进行增量改进
3. 确保与现有配置的兼容性
4. 保留有效的数据分析方法
5. 优化或扩展现有的图表和洞察
`
    : `
请创建一个新的报表配置：
1. 深入分析数据结构和特点
2. 发现数据中的关键模式和趋势
3. 生成有意义的可视化图表
4. 提供有价值的数据洞察
5. 确保分析结果清晰易懂
`

  return `${basePrompt}
${modePrompt}
${dataRequirements(data)}
${returnStructureRequirements}
${coreRequirements}

<doc>${doc}</doc>

请使用 <shata-ai-code> 标签包裹你生成的代码，直接返回可执行的 JavaScript 代码。
注意:
1. 不要将代码包装在函数定义中
2. 直接使用传入的 data 参数
3. 直接返回分析结果对象
4. 确保返回对象包含必要的 type 和 data 字段
5. data 字段必须保持原始数据不变
6. 统计结果放在 analysis 字段中

返回 markdown 格式示例,必须 \`\`\`mo 开头 \`\`\`结尾：
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

export default generateSystemPrompt
