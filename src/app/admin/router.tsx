import { Route } from "react-router-dom"
import AdminPage from "./src/App"
import EnterpriseSettings from "./src/pages/EnterpriseSettings"
import Dashboard from "./src/pages/Dashboard"
import AppManagement from "@/app/admin/src/pages/AppManagement"
import PendingTasks from "@/pages/pending-tasks"
import FileManager from "./src/pages/FileManager"
import { PermissionCheck } from "@/app/admin/src/permissions/components/PermissionCheck"
import PageEditor from "@/app/admin/src/pages/AppManagement/components/PageEditor"
import AppBuilder from "@/app/admin/src/pages/AppBuilder/AppEdit"

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
