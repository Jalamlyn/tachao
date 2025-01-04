import expenseTrackerTemplate from './nextui/nextui_expense_tracker'

export interface AppTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'blank' | 'portal' | 'enterprise' | 'ecommerce' | 'ai' | 'form'
  code: string
}

export const templates: Record<string, AppTemplate> = {
  expense_tracker: {
    id: 'expense_tracker',
    name: 'AI记账助手',
    description: '智能记账、票据识别、支出统计',
    icon: 'mdi:cash-register',
    category: 'ai',
    code: expenseTrackerTemplate
  }
}