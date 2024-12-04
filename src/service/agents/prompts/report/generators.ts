import { DataStructureTemplate, DataSourceInfo } from './types'

export function generateDataStructureDescription(data: DataStructureTemplate): string {
  return Object.entries(data.groups)
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

export function generateDataStatistics(data: DataStructureTemplate): string {
  return Object.entries(data.groups)
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

export function generateActualData(data: DataStructureTemplate): string {
  return Object.entries(data.groups)
    .map(([templateId, items]) => {
      const templateTitle = data.templateInfoMap[templateId] || `模板 ${templateId}`
      const actualData = items.slice(0, 10)

      return `
${templateTitle} (模板ID: ${templateId}) 的数据:
${JSON.stringify(actualData, null, 2)}
    `
    })
    .join("\n")
}

export function generateDataSourceInfo(data: any[], templateInfoMap: Record<string, string> = {}): string {
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

  const dataStructure = {
    groups,
    templateInfoMap
  }

  return `
数据源概览:
${Object.entries(groups)
  .map(([templateId, items]) => `- ${templateInfoMap[templateId] || `模板 ${templateId}`} (${items.length} 条数据)`)
  .join("\n")}

数据结构说明:
${generateDataStructureDescription(dataStructure)}

数据统计信息:
${generateDataStatistics(dataStructure)}

实际数据:
${generateActualData(dataStructure)}

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

export function generateExistingConfigPrompt(existingConfig: string): string {
  return `
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
}