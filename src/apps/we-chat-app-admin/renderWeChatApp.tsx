import { Route, Routes } from "react-router-dom"
import AdminPage from "./src/App"
import ApplicationList from "./src/ApplicationList"
import EnterpriseSettings from "./src/EnterpriseSettings"
import AppDetail from "./src/AppDetail"
import DynamicFormTestPage from "@/pages/DynamicFormTestPage"

export default function renderWeChatApp() {
  return (
    <Route path='/we-chat-app/admin' element={<AdminPage />}>
      <Route path='applications' element={<ApplicationList />} />
      <Route path='applications/:appId' element={<AppDetail />} />
      <Route path='settings' element={<EnterpriseSettings />} />
      <Route path='documents' element={<DynamicFormTestPage />} />
    </Route>
  )
}