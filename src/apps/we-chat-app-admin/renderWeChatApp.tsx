import { Route, Routes } from "react-router-dom"
import AdminPage from "@/apps/we-chat-app-admin/src/App"
import EnterpriseSettings from "@/apps/we-chat-app-admin/src/EnterpriseSettings"
import FormTempManager from "@/pages/form-temp-manager"
import FormManager from "@/pages/form-manager"
import FormPreview from "@/pages/form-temp-manager/components/FormPreview"
import AIFormEditor from "@/pages/form-temp-manager/AIFormEditor"
import FormDataManager from "@/pages/form-temp-manager/FormDataManager"
import FormAnalysis from "@/pages/form-analysis/FormAnalysis"
import ResourceManagement from "@/pages/resource-management"
import ResourceDetail from "@/pages/resource-management/ResourceDetail"
import ReportManagement from "@/pages/report-management"
import AIReportEditor from "@/pages/report-management/AIReportEditor"
import Dashboard from "@/apps/we-chat-app-admin/src/Dashboard"
import AppManagement from "@/pages/app-management"
import PendingTasks from "@/pages/pending-tasks"
import FileManager from "@/apps/we-chat-app-admin/src/FileManager"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"
import PageEditor from "@/pages/app-management/components/PageEditor"

export default function renderWeChatApp() {
  return (
    <Route
      path='/we-chat-app/admin'
      element={
        <PermissionCheck resourceType='page' resourceId='/we-chat-app/admin'>
          <AdminPage />
        </PermissionCheck>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path='settings' element={<EnterpriseSettings />} />
      <Route path='documents' element={<FormTempManager />} />
      <Route path='forms' element={<FormManager />} />
      <Route path='documents/create' element={<AIFormEditor />} />
      <Route path='documents/edit/:templateId' element={<AIFormEditor />} />
      <Route path='documents/data/:templateId' element={<FormDataManager />} />
      <Route path='form-preview/:templateId' element={<FormPreview />} />
      <Route path='resources' element={<ResourceManagement />} />
      <Route path='resources/:resourceId' element={<ResourceDetail />} />
      <Route path='reports' element={<ReportManagement />} />
      <Route path='reports/ai/create/:templateId' element={<AIReportEditor />} />
      <Route path='reports/ai/:reportId' element={<AIReportEditor />} />
      <Route path='ai-assistant' element={<FormAnalysis />} />
      <Route path='apps' element={<AppManagement />} />
      <Route path='pending-tasks' element={<PendingTasks />} />
      <Route path='file-manager' element={<FileManager />} />
      {/* 页面编辑器路由 */}
      <Route
        path='apps/:appId/pages/create'
        element={
          <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
            <PageEditor />
          </PermissionCheck>
        }
      />
      {/* 新增编辑页面路由 */}
      <Route
        path='apps/:appId/pages/:pageId/edit'
        element={
          <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
            <PageEditor />
          </PermissionCheck>
        }
      />
    </Route>
  )
}