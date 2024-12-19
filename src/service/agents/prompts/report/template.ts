import {
  BASE_ROLE_DEFINITION,
  SCENE_RECOGNITION_TEMPLATE,
  THINKING_PROCESS_TEMPLATE,
  REFLECTION_TEMPLATE,
  RETURN_STRUCTURE_REQUIREMENTS,
  DATA_SOURCE_REQUIREMENTS,
} from "./constants"
import { PromptTemplate } from "./types"

export const templates: PromptTemplate = {
  base: {
    roleDefinition: BASE_ROLE_DEFINITION,
    sceneRecognition: SCENE_RECOGNITION_TEMPLATE,
    thinkingProcess: THINKING_PROCESS_TEMPLATE,
  },
  analysis: {
    reflection: REFLECTION_TEMPLATE,
    requirements: RETURN_STRUCTURE_REQUIREMENTS,
  },
}

export const dataAccessExamples = `
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

1. ❌ 错误的组件格式:
const WrongComponent = ({ data }) => {
  return {
    type: 'analyze',
    data: data,
    analysis: {
      summary: {
        total: {
          value: data.length,  // ❌ 错误：data 不是数组
          label: '总数'
        }
      }
    }
  }
}

2. ✅ 正确的组件格式:
export default () => {
  // 1. 在组件内部构建分析配置
  const analysis = {
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
  }

  // 2. 返回 AnalysisResult 组件
  return <AnalysisResult analysis={analysis} />
}

常见分析模式:

1. 单数据源完整分析:
export default () => {
  const firstGroupId = Object.keys(data.groups)[0]
  const firstGroup = data.groups[firstGroupId]
  const items = firstGroup.data

  const analysis = {
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

  return <AnalysisResult analysis={analysis} />
}

2. 多数据源汇总分析:
export default () => {
  const allGroups = Object.entries(data.groups)
  const totalCount = allGroups.reduce((sum, [_, group]) => sum + group.data.length, 0)

  const analysis = {
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

  return <AnalysisResult analysis={analysis} />
}

3. 地理数据分析:
export default () => {
  const firstGroup = data.groups[Object.keys(data.groups)[0]]
  const locations = firstGroup.data

  const analysis = {
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

  return <AnalysisResult analysis={analysis} />
}

注意事项:
1. 必须通过 data.groups 访问数据
2. 每个统计项都要包含 sourceId 和 sourceTitle
3. 使用 Object.keys(data.groups) 获取所有数据源ID
4. 使用 Object.values(data.groups) 获取所有数据源组
5. 图表数据必须包含数据源信息
6. 洞察信息必须关联数据源ID
7. 不要直接访问 data[0] 或 data.length
8. 必须返回完整的 React 组件
9. 必须使用 AnalysisResult 组件包装分析结果
`

export const returnStructureRequirements = RETURN_STRUCTURE_REQUIREMENTS
export const dataSourceRequirements = DATA_SOURCE_REQUIREMENTS
