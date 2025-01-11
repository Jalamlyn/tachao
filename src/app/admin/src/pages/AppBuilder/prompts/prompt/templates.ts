import expenseTrackerTemplate from "../nextui/nextui_expense_tracker"
import enterpriseBussiness from "../nextui/nextui_delivery"
import intelligentFormTemplate from "../nextui/nextui_intelligent_form"
import formAnalysisTemplate from "../nextui/nextui_form_analysis"
import formBackendTemplate from "../nextui/nextui_form_backend"
import formAIAssistantTemplate from "../nextui/nextui_form_ai_assistant"

export interface AppTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: "blank" | "portal" | "enterprise" | "ecommerce" | "ai" | "form"
  type: "form" | "ai"
  code: string
  suiteId?: string
  suiteName?: string
  suiteOrder?: number
}

export const templates: Record<string, AppTemplate> = {
  expense_tracker: {
    id: "expense_tracker",
    name: "AI记账助手",
    description: "智能记账、票据识别、支出统计",
    icon: "mdi:cash-register",
    category: "ai",
    type: "ai",
    code: expenseTrackerTemplate,
  },
  enterprise_dashboard: {
    id: "enterprise_dashboard",
    name: "智能企业应用",
    description: "中小企业智能数字化系统，助力企业数字化转型。",
    icon: "solar:buildings-2-bold-duotone",
    category: "enterprise",
    type: "form",
    code: enterpriseBussiness,
  },
  intelligent_form: {
    id: "intelligent_form",
    name: "智能表单",
    description: "智能化的表单设计与数据收集系统，支持复杂逻辑和智能验证。流程控制, 修改全记录",
    icon: "mdi:form-select",
    category: "form",
    type: "form",
    code: intelligentFormTemplate,
    suiteId: "form_suite",
    suiteName: "智能表单套件",
    suiteOrder: 1,
  },
  form_analysis: {
    id: "form_analysis",
    name: "表单分析应用",
    description: "智能表单的可视化分析报表",
    icon: "mdi:chart-box",
    category: "form",
    type: "form",
    code: formAnalysisTemplate,
    suiteId: "form_suite",
    suiteName: "智能表单套件",
    suiteOrder: 2,
  },
  form_backend: {
    id: "form_backend",
    name: "表单后台应用",
    description: "智能表单配套后台管理系统，支持表单数据的管理和查询。",
    icon: "mdi:view-dashboard",
    category: "form",
    type: "form",
    code: formBackendTemplate,
    suiteId: "form_suite",
    suiteName: "智能表单套件",
    suiteOrder: 3,
  },
  form_ai_assistant: {
    id: "form_ai_assistant",
    name: "表单 AI 助手",
    description: "智能表单配套的 AI 助手, 支持自然语言对话对表单数据进行分析和查询",
    icon: "mdi:robot",
    category: "form",
    type: "form",
    code: formAIAssistantTemplate,
    suiteId: "form_suite",
    suiteName: "智能表单套件",
    suiteOrder: 4,
  },
}
