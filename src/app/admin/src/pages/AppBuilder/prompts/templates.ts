import expenseTrackerTemplate from "./nextui/nextui_expense_tracker"
import enterpriseBussiness from "./nextui/nextui_bussiness"

export interface AppTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: "blank" | "portal" | "enterprise" | "ecommerce" | "ai" | "form"
  code: string
}

export const templates: Record<string, AppTemplate> = {
  expense_tracker: {
    id: "expense_tracker",
    name: "AI记账助手",
    description: "智能记账、票据识别、支出统计",
    icon: "mdi:cash-register",
    category: "ai",
    code: expenseTrackerTemplate,
  },
  enterprise_dashboard: {
    id: "enterprise_dashboard",
    name: "委外加工管理系统",
    description: "用于离散制造的委外加工系统",
    icon: "solar:buildings-2-bold-duotone",
    category: "enterprise",
    code: enterpriseBussiness,
  },
}
