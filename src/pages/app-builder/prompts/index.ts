import { BASE_PROMPTS } from './base-prompts'
import { ROUTER_PROMPTS } from './router-prompts'
import { COMPONENT_PROMPTS } from './component-prompts'
import { TECH_PROMPTS } from './tech-prompts'
import { ENV_PROMPTS } from './env-prompts'
import { API_PROMPTS } from './api-prompts'

export const PROMPTS = {
  ...BASE_PROMPTS,
  ...ROUTER_PROMPTS,
  ...COMPONENT_PROMPTS,
  ...TECH_PROMPTS,
  ...ENV_PROMPTS,
  ...API_PROMPTS
}

// 提示词组合器
export const promptsComposer = {
  getSystemPrompt() {
    return `${BASE_PROMPTS.systemRole}

${BASE_PROMPTS.thoughtChain}

${BASE_PROMPTS.reflection}

${BASE_PROMPTS.codeGeneration}

${API_PROMPTS.multimodal}

1. 代码生成顺序：
   - 如果应用入口代码不存在，必须先生成入口代码
   - 入口代码生成后，才能生成或修改页面代码
   - 每次修改都要确保路由配置与页面一致

2. 路由系统说明：
${ROUTER_PROMPTS.routingSystem}

${COMPONENT_PROMPTS.appEntry}

${COMPONENT_PROMPTS.pageComponent}

${COMPONENT_PROMPTS.componentRules}

${ENV_PROMPTS.preview}

注意事项：
1. 生成的代码必须完整，不能省略
2. 必须包含错误处理
3. 必须考虑性能优化
4. 必须遵循 React 最佳实践
5. 必须使用 JavaScript，不能使用 TypeScript
6. 必须先有应用入口代码才能生成页面代码`
  },
  
  getCodeGenerationPrompt() {
    return `${BASE_PROMPTS.codeGeneration}
${COMPONENT_PROMPTS.appEntry}
${COMPONENT_PROMPTS.pageComponent}`
  },

  getRouterPrompt() {
    return `${ROUTER_PROMPTS.routingSystem}
${ROUTER_PROMPTS.routingRules}
${ROUTER_PROMPTS.navigationSystem}`
  },

  getTechPrompt() {
    return `${TECH_PROMPTS.nextUI}
${TECH_PROMPTS.tailwind}
${TECH_PROMPTS.framerMotion}`
  },

  getEnvPrompt() {
    return `${ENV_PROMPTS.preview}
${ENV_PROMPTS.routing}
${ENV_PROMPTS.basePath}`
  }
}