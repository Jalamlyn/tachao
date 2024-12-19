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
   - React：通过参数注入的 React 对象
   - AnalysisResult：通过参数注入的结果展示组件
   - data：通过参数注入的已处理数据对象

3. 组件接口规范：
   export default ({ data }) => {
     // 组件实现
     return <AnalysisResult analysis={...} />
   }

4. 数据结构说明：
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

5. 代码示例：
   // ❌ 错误示例
   import React, { useState } from 'react'
   const { useState, useEffect } = React
   
   // ✅ 正确示例
   const [state, setState] = React.useState(initial)
   React.useEffect(() => {}, [])
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
    `<doc>${doc}</doc>`
  ]

  if (existingConfig) {
    promptParts.push(generateExistingConfigPrompt(existingConfig))
  }

  promptParts.push(`
请使用 <shata-ai-code> 标签包裹你生成的代码,直接返回可执行的 JavaScript 代码。
注意:
1. 不要将代码包装在函数定义中
2. 直接使用传入的 data 参数
3. 直接返回分析结果对象
4. 确保返回对象包含必要的 type 和 data 字段
5. 统计结果放在 analysis 字段中

分析流程：
1. 首先进行场景识别 <shata-ai-scene>
2. 然后进行思考过程 <shata-ai-think>
3. 必要时进行反思 <shata-ai-reflection>
4. 最后生成分析代码 <shata-ai-code>

请确保完整执行以上流程，保证分析的质量和可靠性。
`)

  return promptParts.join("\n\n")
}

export default generateSystemPrompt