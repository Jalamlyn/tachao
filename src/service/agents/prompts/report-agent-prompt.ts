import { mapVisualizationGuide } from "./map-visualization-guide"
import { generateDataSourceInfo, generateExistingConfigPrompt } from "./report/generators"
import { templates } from "./report/template"
import { SystemPromptOptions } from "./report/types"

const generateSystemPrompt = ({ data, doc, existingConfig, templateInfoMap = {} }: SystemPromptOptions): string => {
  const promptParts = [
    templates.base.roleDefinition,
    templates.base.sceneRecognition,
    templates.base.thinkingProcess,
    templates.analysis.reflection,
    generateDataSourceInfo(data, templateInfoMap),
    `

## 2. 代码规范
1. 必须使用函数组件
2. 组件名必须是 ReportAnalysis
3. 必须处理 loading 状态
4. 必须处理错误情况
5. 必须返回 AnalysisResult 组件

## 3. 数据处理规范
1. 保持数据结构与 AnalysisResult 组件一致
2. 必须包含 summary, charts, insights 等关键字段
3. 确保数据格式正确

## 7. 注意事项
1. 不要使用类组件
2. 不要使用外部状态管理
3. 保持代码简洁清晰
4. 确保类型正确
5. 提供必要的注释
`,
    mapVisualizationGuide,
    `<doc>${doc}</doc>`,
  ]

  if (existingConfig) {
    promptParts.push(generateExistingConfigPrompt(existingConfig))
  }

  promptParts.push(`

注意:
1. 必须生成完整的组件代码
2. 必须包含所有必要的状态管理
3. 必须处理错误情况
4. 必须使用 AnalysisResult 组件
5. 确保代码可以正常执行
6. 不使用 import 引入和外部依赖

分析流程：
1. 首先进行场景识别 <shata-ai-scene>
2. 然后进行思考过程 <shata-ai-think>
3. 必要时进行反思 <shata-ai-reflection>
4. 最后返回下列结构的代码,不使用 import 引入和外部依赖:
"""
\`\`\`mo
<shata-ai-code>
export default ({ data, templateId}) => {
  // 状态管理
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  // 数据处理
  const analysisData = React.useMemo(() => {
    try {
      return {
        summary: {
          total: {
            value: data.length,
            label: '总数'
          }
        },
        charts: [{
          type: 'pie',
          title: '数据分布',
          data: []
        }],
        insights: [{
          content: '数据分析结果'
        }]
      }
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [data])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return <AnalysisResult analysis={analysisData} />
}

</shata-ai-code>
\`\`\`
"""


请确保完整执行以上流程，保证分析的质量和可靠性。
`)

  return promptParts.join("\n\n")
}

export default generateSystemPrompt
