import { BASE_PROMPTS } from "./prompt/base-prompts"
import { ROUTER_PROMPTS } from "./prompt/router-prompts"
import { COMPONENT_PROMPTS } from "./prompt/component-prompts"
import { EXPERIENCE_PROMPTS } from "./prompt/experience-prompts"
import { UI_DESIGN_PROMPTS } from "./prompt/ui-design-prompts"
import { RESOURCE_PROMPTS } from "./prompt/resource-prompts"
import { LOCATION_PROMPTS } from "./prompt/location-prompts"
import { ESM_PROMPTS } from "./prompt/esm-prompts"
import { AI_PROMPTS } from "./prompt/ai-prompts"

// 提示词组合器
export const promptsComposer = {
  async getSystemPrompt() {
    // 获取资源提示词
    const resourcePrompt = await RESOURCE_PROMPTS.resourcePrompt.getResourcePrompt()

    return `${BASE_PROMPTS.systemRole}

${BASE_PROMPTS.thoughtChain}

${BASE_PROMPTS.reflection}

${BASE_PROMPTS.codeGeneration}

${EXPERIENCE_PROMPTS.apiExperience.metadata}

<ui-design-principles>
${UI_DESIGN_PROMPTS.designPrinciples}
${UI_DESIGN_PROMPTS.interactionDesign}
${UI_DESIGN_PROMPTS.userExperience}
${UI_DESIGN_PROMPTS.componentDesign}
${UI_DESIGN_PROMPTS.designSystem}
${UI_DESIGN_PROMPTS.motionDesign}
${UI_DESIGN_PROMPTS.designAnalysis}
</ui-design-principles>

<api-doc>
${LOCATION_PROMPTS.locationPrompt}
${ESM_PROMPTS.esmPrompt}
${AI_PROMPTS.aiPrompt}
</api-doc>

<business-resources>
${resourcePrompt}
</business-resources>

1. 代码生成顺序：
   - 如果应用入口代码不存在，必须先生成入口代码
   - 入口代码生成后，才能生成或修改页面代码
   - 每次修改都要确保路由配置与页面一致

2. 路由系统说明：
${ROUTER_PROMPTS.routingSystem}

3. 代码类型说明：
${COMPONENT_PROMPTS.appEntry}
${COMPONENT_PROMPTS.pageComponent}
其他可用的模块 type 包括:
- module
- service
- store
- utils
- markdown
- component
- constants

4. 技术规范：
${COMPONENT_PROMPTS.componentRules}`
  },

  getCodeGenerationPrompt() {
    return `${BASE_PROMPTS.codeGeneration}
`
  },

  getRouterPrompt() {
    return `${ROUTER_PROMPTS.routingSystem}
${ROUTER_PROMPTS.routingRules}
${ROUTER_PROMPTS.navigationSystem}`
  },
}
