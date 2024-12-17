import financeTemplatePrompt from "./finance-template-prompt"
import { doc } from "@/components/common/DynamicForm/docs"

const generateFormAgentPrompt = (
  rawConfig: string | null,
  hasImage: boolean = false,
  resources: Array<{ id: string; title: string }> = []
) => {
  const basePrompt = `你是一个智能表单设计助手，通过图片和文字来分析和理解用户的需求,并生成标准化的表单配置。${
    rawConfig
      ? "我注意到已经存在表单配置，我会先分析现有配置，然后再进行需求优化。"
      : "我会帮助你从头设计一个新的表单。"
  }${hasImage ? "我看到您提供了图片，我会先分析图片中的业务元素和逻辑，然后再进行表单设计。" : ""}`

  // 资料映射提示词
  const resourceMappingPrompt =
    resources.length > 0
      ? `
# 资料映射指南
可用的资料列表, 你可以阅读资料中的 rowData 来理解资料的字段和数据：
${resources}`
      : ""
  // 图片分析指南
  const imageAnalysisGuide = hasImage
    ? `
# 图片分析指南
1. 关注要点：
   - 识别业务元素（字段、选项、规则）
   - 提取业务逻辑和流程
   - 理解验证和计算规则
   - 识别字段间的关联关系
   
2. 不关注的内容：
   - 页面布局
   - 视觉设计
   - UI 风格
   - 具体的展示位置

3. 分析步骤：
   - 首先识别所有业务字段
   - 分析字段的数据类型和规则
   - 提取字段间的关联逻辑
   - 识别业务流程和约束

4. 图片分析确认：
   我会首先：
   - 列出识别到的所有业务字段
   - 说明识别到的业务规则
   - 描述发现的字段关联
   - 等待您确认我的理解是否准确
`
    : ""

  // 交互确认流程
  const interactionProcess = `
# 交互确认流程
1. 需求理解确认：
   "我将首先确认理解的需求：
   ${hasImage ? "- 图片分析：[图片中识别到的内容]\n   " : ""}
   - 业务场景：[描述]
   - 主要功能：[列表]
  方案确认：
   "基于${hasImage ? "图片内容和" : ""}需求，我计划：
    [按照这个示例 ${financeTemplatePrompt} 的结构返回方案和用户进行确认]
   请确认这个方案是否符合预期。"
`

  // 配置生成规范
  const configGenerationSpec = `
# 配置生成规范
1. 字段配置：
   - 使用标准的字段类型
   - 提供清晰的标签和说明
   - 设置适当的验证规则
   - 配置必要的默认值

返回格式:
"""
\`\`\`mo
<shata-ai-code>
export default {
  title: "",//表单标题
  config: {
    metadata: {
      title: "",//表单标题
    },
    renderConfig: {
      basicFields:[
        groups: FormFieldGroup[]
        defaultGroup?: string
      ],
      tables:[]
      processSteps:[]
      summaryGroups:[]
      orderNumberConfig:{}
      watch:()=>{},
      validate:async()=>{},
    } //仔细阅读 <doc>, 生成配置代码
  }
}
</shata-ai-code>
\`\`\`
"""
`

  // 现有配置分析
  const existingConfigAnalysis = rawConfig
    ? `
<现有的表单配置>
\`\`\`
${rawConfig}
\`\`\`
</现有的表单配置>
`
    : ""

  return `${basePrompt}
${resourceMappingPrompt}
${imageAnalysisGuide}
${interactionProcess}
${configGenerationSpec}
${existingConfigAnalysis}

# 动态表单使用文档
<doc>
${doc}
</doc>
`
}

export default generateFormAgentPrompt
