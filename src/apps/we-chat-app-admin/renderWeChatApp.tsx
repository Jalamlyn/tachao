import { Route, Routes } from "react-router-dom"
import AdminPage from "./src/App"
import ApplicationList from "./src/ApplicationList"
import EnterpriseSettings from "./src/EnterpriseSettings"
import AppDetail from "./src/AppDetail"
import FormTempManager from "@/pages/FormTempManager.index"
import FormManager from "@/pages/FormManager.index"
import FormPreview from "@/pages/FormTempManager.component.FormPreview"
import AIFormEditor from "@/pages/FormTempManager.page.AIFormEditor"
import FormAnalysis from "@/pages/FormManager.component.FormAnalysis"
import PageTemplateManager from "./src/PageTemplateManager"
import PageTemplateEditor from "./src/PageTemplateEditor"

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
      {/* 添加页面模板路由 */}
      <Route path='pages' element={<PageTemplateManager />} />
      <Route path='pages/create' element={<PageTemplateEditor />} />
      <Route path='pages/edit/:templateId' element={<PageTemplateEditor />} />
    </Route>
  )
}