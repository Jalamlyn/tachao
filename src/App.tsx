import React, { createContext, useState, useEffect } from "react"
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
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
import AIHomePage from "./pages/AIHomePage"
import DataAnalysisPage from "./pages/DataAnalysisPage"
import CreateFormPage from "./pages/CreateFormPage"
import DynamicFormTestPage from "./pages/DynamicFormTestPage"
import renderWeChatApp from "./apps/we-chat-app-admin/renderWeChatApp"
import FormPreview from "./pages/FormTempManager/components/FormPreview"
import Form from "./pages/Form"

function App() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const currentLang = getCurrentLanguage()
    i18n.changeLanguage(currentLang)
  }, [])

  const shouldRedirectToLogin = () => {
    const publicPaths = ["/", "/we-chat-login"]
    if (!publicPaths.includes(location.pathname)) {
      const token = localStorage.getItem("model-base-user-token")
      return !token
    }
    return false
  }

  return (
    <NextUIProvider navigate={navigate}>
      <div className='min-h-screen'>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/ai' element={shouldRedirectToLogin() ? <Navigate to='/we-chat-login' /> : <AIHomePage />}>
            <Route index element={<Navigate to='management' replace />} />
            <Route path='create' element={<CreateFormPage />} />
            <Route path='analysis' element={<DataAnalysisPage />} />
            <Route path='test-form' element={<DynamicFormTestPage />} />
          </Route>
          <Route path='/we-chat-login' element={<WeChatLoginPage />} />
          <Route path='/form-preview/:templateId' element={<FormPreview />} />
          <Route path='/form/:formId' element={<Form />} />
          <Route
            path='/forms/:id'
            element={shouldRedirectToLogin() ? <Navigate to='/we-chat-login' /> : <FormRenderer />}
          />
          <Route
            path='/forms/analysis'
            element={shouldRedirectToLogin() ? <Navigate to='/we-chat-login' /> : <AnalysisPage />}
          />
          <Route
            path='/resources/view/:id'
            element={shouldRedirectToLogin() ? <Navigate to='/we-chat-login' /> : <ResourceDataTable />}
          />
          <Route
            path='/reports/create'
            element={shouldRedirectToLogin() ? <Navigate to='/we-chat-login' /> : <CreateReportPage />}
          />
          <Route
            path='/reports/view/:id'
            element={shouldRedirectToLogin() ? <Navigate to='/we-chat-login' /> : <ReadReportRenderer />}
          />
          {renderWeChatApp()}
        </Routes>
        <Toaster />
      </div>
    </NextUIProvider>
  )
}

export default App
