import expenseTrackerTemplate from "../nextui/nextui_expense_tracker"
import enterpriseBussiness from "../nextui/nextui_delivery"
import intelligentFormTemplate from "../nextui/nextui_intelligent_form"
import formAnalysisTemplate from "../nextui/nextui_form_analysis"

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
    description: "中小企业数据采集分析智能表单系统，助力企业数字化转型。",
    icon: "solar:buildings-2-bold-duotone",
    category: "enterprise",
    type: "form",
    code: enterpriseBussiness,
  },
  intelligent_form: {
    id: "intelligent_form",
    name: "智能表单应用",
    description: "智能化的表单设计与数据收集系统，支持复杂逻辑和智能验证。",
    icon: "mdi:form-select",
    category: "form",
    type: "form",
    code: intelligentFormTemplate,
    suiteId: "form_suite",
    suiteName: "智能表单套件",
    suiteOrder: 1
  },
  form_analysis: {
    id: "form_analysis",
    name: "表单分析应用",
    description: "深度分析表单数据，生成可视化报表，提供智能决策支持。",
    icon: "mdi:chart-box",
    category: "form",
    type: "form",
    code: formAnalysisTemplate,
    suiteId: "form_suite",
    suiteName: "智能表单套件",
    suiteOrder: 2
  }
}