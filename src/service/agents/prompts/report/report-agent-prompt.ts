import { mapVisualizationGuide } from "../map-visualization-guide"
import { templates } from "./template"
import { generateDataSourceInfo, generateExistingConfigPrompt } from "./generators"
import { SystemPromptOptions } from "./types"

const generateSystemPrompt = ({ data, doc, existingConfig, templateInfoMap = {} }: SystemPromptOptions): string => {
  const promptParts = [
    templates.base.roleDefinition,
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
5. data 字段必须保持原始数据不变
6. 统计结果放在 analysis 字段中

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