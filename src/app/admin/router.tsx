import { Route } from "react-router-dom"
import AdminPage from "./App"
import EnterpriseSettings from "./src/pages/EnterpriseSettings"
import Dashboard from "./src/pages/Dashboard"
import AppManagement from "./src/pages/AppManagement"
import PendingTasks from "./src/pages/PendingTasks"
import FileManager from "./src/pages/FileManager"
import AppBuilder from "./src/pages/AppBuilder/AppEdit"
import ResourceManagement from "./src/pages/ResourceManagement"
import ResourceDetail from "./src/pages/ResourceManagement/ResourceDetail"
import { Provider } from "@/provider"
import RechargeModal from "@/components/RechargeModal"

export default function renderRouter() {
  return (
    <Route
      path='/admin'
      element={
        <Provider>
          <AdminPage />
          <RechargeModal />
        </Provider>
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
