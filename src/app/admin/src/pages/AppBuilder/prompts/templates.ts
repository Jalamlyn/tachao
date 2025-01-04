import expenseTrackerTemplate from './nextui/nextui_expense_tracker'
import enterpriseDashboardTemplate from './nextui/nextui_enterprise_dashboard'

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
  },
  enterprise_dashboard: {
    id: 'enterprise_dashboard',
    name: '企业级管理系统',
    description: '现代化的企业管理系统模板，包含数据管理、用户设置等功能',
    icon: 'solar:buildings-2-bold-duotone',
    category: 'enterprise',
    code: enterpriseDashboardTemplate
  }
}