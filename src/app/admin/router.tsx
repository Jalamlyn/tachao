import { Route } from "react-router-dom"
import AdminPage from "./App"
import EnterpriseSettings from "./src/pages/EnterpriseSettings"
import Dashboard from "./src/pages/Dashboard"
import AppManagement from "./src/pages/AppManagement"
import PendingTasks from "./src/pages/PendingTasks"
import FileManager from "./src/pages/FileManager"
import { PermissionCheck } from "./src/permissions/components/PermissionCheck"
import AppBuilder from "./src/pages/AppBuilder/AppEdit"
import ResourceManagement from "./src/pages/resource-management"
import ResourceDetail from "./src/pages/resource-management/ResourceDetail"

export default function renderRouter() {
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
      <Route path='apps/:appId/builder' element={<AppBuilder />} />
      <Route path='resources' element={<ResourceManagement />} />
      <Route path='resources/:resourceId' element={<ResourceDetail />} />
    </Route>
  )
}
