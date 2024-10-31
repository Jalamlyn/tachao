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

function App() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const currentLang = getCurrentLanguage()
    i18n.changeLanguage(currentLang)
  }, [])

  // 检查是否需要重定向到登录页面
  const shouldRedirectToLogin = () => {
    const publicPaths = ['/', '/we-chat-login']
    if (!publicPaths.includes(location.pathname)) {
      const token = sessionStorage.getItem('x-app-id')
      return !token
    }
    return false
  }

  return (
    <NextUIProvider navigate={navigate}>
      <div className='min-h-screen'>
        <Routes>
          {/* 新增路由 - 将根路由指向 LandingPage */}
          <Route path='/' element={<LandingPage />} />
          {/* 原有路由 */}
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