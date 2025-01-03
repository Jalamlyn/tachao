import { BASE_PROMPTS } from "./base-prompts"
import { ROUTER_PROMPTS } from "./router-prompts"
import { COMPONENT_PROMPTS } from "./component-prompts"
import { TECH_PROMPTS } from "./tech-prompts"
import { ENV_PROMPTS } from "./env-prompts"
import { EXPERIENCE_PROMPTS } from "./experience-prompts"

export const PROMPTS = {
  ...BASE_PROMPTS,
  ...ROUTER_PROMPTS,
  ...COMPONENT_PROMPTS,
  ...TECH_PROMPTS,
  ...ENV_PROMPTS,
  ...EXPERIENCE_PROMPTS,
}

// 提示词组合器
export const promptsComposer = {
  getSystemPrompt() {
    return `${BASE_PROMPTS.systemRole}

${BASE_PROMPTS.thoughtChain}

${BASE_PROMPTS.reflection}

${BASE_PROMPTS.codeGeneration}

${EXPERIENCE_PROMPTS.apiExperience.metadata}


1. 代码生成顺序：
   - 如果应用入口代码不存在，必须先生成入口代码
   - 入口代码生成后，才能生成或修改页面代码
   - 每次修改都要确保路由配置与页面一致

2. 路由系统说明：
${ROUTER_PROMPTS.routingSystem}

3. 代码类型说明：
${COMPONENT_PROMPTS.appEntry}
${COMPONENT_PROMPTS.pageComponent}
${COMPONENT_PROMPTS.storeTemplate}
${COMPONENT_PROMPTS.serviceTemplate}
${COMPONENT_PROMPTS.moduleTemplate}

4. 技术规范：
${COMPONENT_PROMPTS.componentRules}
${TECH_PROMPTS.mobx}
${TECH_PROMPTS.metadata}

5. 环境说明：
${ENV_PROMPTS.preview}

注意事项：
1. 生成的代码必须完整，不能省略
2. 必须包含错误处理
3. 必须考虑性能优化
4. 必须遵循 React 最佳实践
5. 必须使用 JavaScript，不能使用 TypeScript
6. 必须先有应用入口代码才能生成页面代码
7. Store 必须使用 MobX
8. Service 必须使用 appId 前缀
9. Module 只能包含纯函数
10. Schema 必须使用标准的 JSON Schema`
  },

  getCodeGenerationPrompt() {
    return `${BASE_PROMPTS.codeGeneration}
${COMPONENT_PROMPTS.appEntry}
${COMPONENT_PROMPTS.pageComponent}
${COMPONENT_PROMPTS.storeTemplate}
${COMPONENT_PROMPTS.serviceTemplate}
${COMPONENT_PROMPTS.moduleTemplate}
`
  },

  getRouterPrompt() {
    return `${ROUTER_PROMPTS.routingSystem}
${ROUTER_PROMPTS.routingRules}
${ROUTER_PROMPTS.navigationSystem}`
  },

  getTechPrompt() {
    return `${TECH_PROMPTS.nextUI}
${TECH_PROMPTS.tailwind}
${TECH_PROMPTS.framerMotion}
${TECH_PROMPTS.mobx}
${TECH_PROMPTS.metadata}`
  },

  getEnvPrompt() {
    return `${ENV_PROMPTS.preview}
${ENV_PROMPTS.routing}
${ENV_PROMPTS.basePath}`
  },
}
