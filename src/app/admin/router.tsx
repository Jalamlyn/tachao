import { Route } from "react-router-dom"
import AdminPage from "./src/App"
import EnterpriseSettings from "./src/EnterpriseSettings"
import Dashboard from "./src/Dashboard"
import AppManagement from "@/pages/app-management"
import PendingTasks from "@/pages/pending-tasks"
import FileManager from "./src/FileManager"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"
import PageEditor from "@/pages/app-management/components/PageEditor"
import AppBuilder from "@/pages/app-builder/AppEdit"

export default function renderWeChatApp() {
  return (
    <Route
      path='/admin'
      element={
        <PermissionCheck resourceType='page' resourceId='/admin'>
          <AdminPage />
        </PermissionCheck>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path='settings' element={<EnterpriseSettings />} />
      <Route path='apps' element={<AppManagement />} />
      <Route path='pending-tasks' element={<PendingTasks />} />
      <Route path='file-manager' element={<FileManager />} />
      <Route path='apps/:appId/pages/create' element={<PageEditor />} />
      <Route path='apps/:appId/pages/:pageId/edit' element={<PageEditor />} />
      <Route path='apps/:appId/builder' element={<AppBuilder />} />
    </Route>
  )
}
