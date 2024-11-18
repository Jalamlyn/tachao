import { Route, Routes } from "react-router-dom"
import AdminPage from "./src/App"
import ApplicationList from "./src/ApplicationList"
import EnterpriseSettings from "./src/EnterpriseSettings"
import AppDetail from "./src/AppDetail"
import FormTempManager from "@/pages/form-temp-manager"
import FormManager from "@/pages/form-manager"
import FormPreview from "@/pages/form-temp-manager/components/FormPreview"
import AIFormEditor from "@/pages/form-temp-manager/AIFormEditor"
import FormAnalysis from "@/pages/FormAnalysis"
import ResourceManagement from "@/pages/resource-management"
import ReportManagement from "@/pages/report-management"
import AIResourceEditor from "@/pages/resource-management/AIResourceEditor"
import AIReportEditor from "@/pages/report-management/AIReportEditor"

export default function renderWeChatApp() {
  return (
    <Route path='/we-chat-app/admin' element={<AdminPage />}>
      <Route path='applications' element={<ApplicationList />} />
      <Route path='applications/:appId' element={<AppDetail />} />
      <Route path='settings' element={<EnterpriseSettings />} />
      <Route path='documents' element={<FormTempManager />} />
      <Route path='forms' element={<FormManager />} />
      <Route path='forms/analysis' element={<FormAnalysis />} />
      <Route path='documents/create' element={<AIFormEditor />} />
      <Route path='documents/edit/:templateId' element={<AIFormEditor />} />
      <Route path='form-preview/:formId' element={<FormPreview />} />
      <Route path='resources' element={<ResourceManagement />} />
      <Route path='resources/ai/:resourceId' element={<AIResourceEditor />} />
      <Route path='reports' element={<ReportManagement />} />
      <Route path='reports/ai/create/:templateId' element={<AIReportEditor />} />
      <Route path='ai-assistant' element={<FormAnalysis />} />
    </Route>
  )
}
