import expenseTrackerTemplate from "./nextui/nextui_expense_tracker"
import enterpriseBussiness from "./nextui/nextui_delivery"

export interface AppTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: "blank" | "portal" | "enterprise" | "ecommerce" | "ai" | "form"
  type: "form" | "ai" // 新增type字段用于区分表单应用和智能应用
  code: string
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
    name: "智能表单应用",
    description: "中小企业数据采集分析智能表单系统，助力企业数字化转型。",
    icon: "solar:buildings-2-bold-duotone",
    category: "enterprise",
    type: "form",
    code: enterpriseBussiness,
  },
}
