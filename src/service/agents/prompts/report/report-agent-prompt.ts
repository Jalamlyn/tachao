import { mapVisualizationGuide } from "../map-visualization-guide"
import { generateDataSourceInfo, generateExistingConfigPrompt } from "./generators"
import { templates } from "./template"
import { SystemPromptOptions } from "./types"

const generateSystemPrompt = ({ data, doc, existingConfig, templateInfoMap = {} }: SystemPromptOptions): string => {
  const executionEnvironmentPrompt = `
你正在生成一个将在受限环境中执行的React组件。请注意：

1. 执行环境限制：
   - ❌ 不能使用 import/export 语句
   - ❌ 不能使用解构的 hooks（如 const { useState } = React）
   - ❌ 不能引用未通过参数传入的外部变量或函数
   - ✅ 所有依赖都通过参数注入
   - ✅ 使用 React.useState 等方式调用 hooks

2. 可用的依赖：
   - React：通过上下文注入的 React 对象
   - AnalysisResult：通过上下文注入的结果展示组件
   - data：通过上下文注入的已处理数据对象

3. 组件格式规范：
❌ 错误格式 - 不要使用这种格式：
export default ({ data, React, AnalysisResult }) => {
  // 错误：不要显式声明这些参数，它们会自动注入
  return <AnalysisResult analysis={...} />
}

✅ 正确格式 - 必须使用这种格式：
export default () => {
  // 正确：这些依赖都是通过上下文注入的
  const analysis = {
    type: 'analyze',
    data: data,
    analysis: {...}
  }
  return <AnalysisResult analysis={analysis} />
}

4. 重要说明：
   - data, React, AnalysisResult 都是通过上下文自动注入的
   - 严禁在组件参数中显式声明这些依赖
   - 直接使用这些变量，它们在运行时会被注入
   - 只有在特殊情况下需要其他参数时才声明参数

5. 代码示例：
// ❌ 错误示例
import React, { useState } from 'react'
const { useState, useEffect } = React
const [state, setState] = useState(initial)
   
// ✅ 正确示例
const [state, setState] = React.useState(initial)
React.useEffect(() => {}, [])

6. 数据结构说明：
   data = {
     groups: {
       [templateId: string]: {
         id: string,
         title: string,
         data: any[]
       }
     },
     metadata: {
       templateInfoMap: Record<string, string>,
       columns: any[]
     }
   }

7. 代码生成注意事项：
   - 必须使用 export default () => {} 格式
   - 不要显式声明任何注入的依赖
   - 保持组件的纯函数特性
   - 确保错误处理
   - 不要使用注释省略任何代码
   - 生成完整的可执行代码
`

  const promptParts = [
    templates.base.roleDefinition,
    executionEnvironmentPrompt,
    templates.base.sceneRecognition,
    templates.base.thinkingProcess,
    templates.analysis.reflection,
    generateDataSourceInfo(data, templateInfoMap),
    templates.analysis.requirements,
    mapVisualizationGuide,
    `<doc>${doc}</doc>`,
  ]

  if (existingConfig) {
    promptParts.push(generateExistingConfigPrompt(existingConfig))
  }

  promptParts.push(`
请使用 <shata-ai-code> 标签包裹你生成的代码,直接返回可执行的 React 组件代码。
注意: 
1. 必须使用 export default () => {} 格式
2. 必须返回 AnalysisResult 组件
3. 确保分析配置包含必要的字段
4. 统计结果必须包含数据源信息
5. 不要使用注释省略任何代码
6. 生成完整的可执行代码

分析流程：
1. 首先进行场景识别 <shata-ai-scene>
2. 然后进行思考过程 <shata-ai-think>
3. 必要时进行反思 <shata-ai-reflection>
4. 最后返回下列结构的代码
\`\`\`mo
<shata-ai-code>
export default () => {
  // 组件实现
  return <AnalysisResult analysis={...} />
}
</shata-ai-code>
\`\`\`

请确保完整执行以上流程，保证分析的质量和可靠性。
`)

  return promptParts.join("\n\n")
}

export default generateSystemPrompt