import { Route, Routes } from "react-router-dom"
import AdminPage from "@/apps/we-chat-app-admin/src/App"
import ApplicationList from "@/apps/we-chat-app-admin/src/ApplicationList"
import EnterpriseSettings from "@/apps/we-chat-app-admin/src/EnterpriseSettings"
import AppDetail from "@/apps/we-chat-app-admin/src/AppDetail"
import FormTempManager from "@/pages/form-temp-manager"
import FormManager from "@/pages/form-manager"
import FormPreview from "@/pages/form-temp-manager/components/FormPreview"
import AIFormEditor from "@/pages/form-temp-manager/AIFormEditor"
import FormDataManager from "@/pages/form-temp-manager/FormDataManager"
import FormAnalysis from "@/pages/form-analysis/FormAnalysis"
import ResourceManagement from "@/pages/resource-management"
import ResourceDetail from "@/pages/resource-management/ResourceDetail"
import ReportManagement from "@/pages/report-management"
import AIResourceEditor from "@/pages/resource-management/AIResourceEditor"
import AIReportEditor from "@/pages/report-management/AIReportEditor"
import Dashboard from "@/apps/we-chat-app-admin/src/Dashboard"
import AppManagement from "@/pages/app-management"
import PendingTasks from "@/pages/pending-tasks"
import FormTemplateSelect from "@/pages/form-temp-manager/components/FormTemplateSelect"

export default function renderWeChatApp() {
  return (
    <Route path='/we-chat-app/admin' element={<AdminPage />}>
      <Route index element={<Dashboard />} />
      <Route path='applications' element={<ApplicationList />} />
      <Route path='applications/:appId' element={<AppDetail />} />
      <Route path='settings' element={<EnterpriseSettings />} />
      <Route path='documents' element={<FormTempManager />} />
      <Route path='forms' element={<FormManager />} />
      <Route path='forms/analysis' element={<FormAnalysis />} />
      <Route path='documents/create' element={<FormTemplateSelect />} />
      <Route path='documents/create/:templateId' element={<AIFormEditor />} />
      <Route path='documents/edit/:templateId' element={<AIFormEditor />} />
      <Route path='documents/data/:templateId' element={<FormDataManager />} />
      <Route path='form-preview/:formId' element={<FormPreview />} />
      <Route path='resources' element={<ResourceManagement />} />
      <Route path='resources/:resourceId' element={<ResourceDetail />} />
      <Route path='resources/ai/:resourceId' element={<AIResourceEditor />} />
      <Route path='reports' element={<ReportManagement />} />
      <Route path='reports/ai/create/:templateId' element={<AIReportEditor />} />
      <Route path='reports/ai/:reportId' element={<AIReportEditor />} />
      <Route path='ai-assistant' element={<FormAnalysis />} />
      <Route path='apps' element={<AppManagement />} />
      <Route path='pending-tasks' element={<PendingTasks />} />
    </Route>
  )
}