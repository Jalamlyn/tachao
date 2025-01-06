import { BASE_PROMPTS } from "./base-prompts"
import { ROUTER_PROMPTS } from "./router-prompts"
import { COMPONENT_PROMPTS } from "./component-prompts"
import { EXPERIENCE_PROMPTS } from "./experience-prompts"
import { UI_DESIGN_PROMPTS } from "./ui-design-prompts"
import { RESOURCE_PROMPTS } from "./resource-prompts"
import { LOCATION_PROMPTS } from "./location-prompts"
import { ESM_PROMPTS } from "./esm-prompts"
import { AI_PROMPTS } from "./ai-prompts"

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
