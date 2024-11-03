import React, { createContext, useState, useEffect } from "react"
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import FormsPage from "@/pages/FormsPage"
import { useTranslation } from "react-i18next"
import { getCurrentLanguage } from "./i18n"
import WeChatLoginPage from "./pages/WeChatLoginPage"
import FormRenderer from "./components/forms/FormRenderer"
import ResourceDataTable from "./components/resource/data-table/ResourceDataTable"
import AnalysisPage from "./pages/AnalysisPage"
import CreateReportPage from "./components/reports/CreateReportPage"
import ReadReportRenderer from "./components/reports/ReadReportRenderer"
import { Toaster } from "./components/ui/toaster"
import LandingPage from "./pages/LandingPage"
import CustomFormBuilder from "./components/forms/custom/CustomFormBuilder"
import AIHomePage from "./pages/AIHomePage"
import DataManagementPage from "./pages/DataManagementPage"
import DataAnalysisPage from "./pages/DataAnalysisPage"

function App() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const currentLang = getCurrentLanguage()
    i18n.changeLanguage(currentLang)
  }, [])

  const shouldRedirectToLogin = () => {
    const publicPaths = ['/', '/we-chat-login']
    if (!publicPaths.includes(location.pathname)) {
      const token = localStorage.getItem('model-base-user-token')
      return !token
    }
    return false
  }

  return (
    <NextUIProvider navigate={navigate}>
      <div className='min-h-screen'>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/ai' element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <AIHomePage />}>
            <Route index element={<Navigate to="management" replace />} />
            <Route path="management" element={<DataManagementPage />} />
            <Route path="analysis" element={<DataAnalysisPage />} />
          </Route>
          <Route 
            path='/forms' 
            element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <FormsPage />} 
          />
          <Route path='/we-chat-login' element={<WeChatLoginPage />} />
          <Route 
            path='/forms/:id' 
            element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <FormRenderer />} 
          />
          <Route 
            path='/forms/custom/create' 
            element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <CustomFormBuilder />} 
          />
          <Route 
            path='/forms/analysis' 
            element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <AnalysisPage />}
          />
          <Route 
            path='/resources/view/:id' 
            element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <ResourceDataTable />} 
          />
          <Route 
            path='/reports/create' 
            element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <CreateReportPage />} 
          />
          <Route 
            path='/reports/view/:id' 
            element={shouldRedirectToLogin() ? <Navigate to="/we-chat-login" /> : <ReadReportRenderer />} 
          />
        </Routes>
        <Toaster />
      </div>
    </NextUIProvider>
  )
}

export default App