import { useEffect } from "react"
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import { useTranslation } from "react-i18next"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getCurrentLanguage } from "./i18n"
import LoginPage from "./pages/LoginPage"
import FormRenderer from "./components/forms/FormRenderer"
import AnalysisPage from "./pages/AnalysisPage"
import CreateReportPage from "./components/reports/CreateReportPage"
import ReadReportRenderer from "./components/reports/ReadReportRenderer"
import { Toaster } from "./components/ui/toaster"
import LandingPage from "./pages/landing"
import AIHomePage from "./pages/AIHomePage"
import renderWeChatApp from "./apps/we-chat-app-admin/renderWeChatApp"
import FormPreview from "./pages/form-temp-manager/components/FormPreview"
import Form from "@/pages/form"
import Report from "@/pages/report"
import ResourceDataTable from "./components/common/data-table/ResourceDataTable"
import AppEntry from "./pages/app-management/components/AppEntry"
import WaitListPage from "./pages/WaitListPage"
import FormCreate from "./pages/form/components/FormCreate"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const currentLang = getCurrentLanguage()
    i18n.changeLanguage(currentLang)
  }, [])

  const shouldRedirectToLogin = () => {
    const publicPaths = ["/", "/login", "/report"]
    if (!publicPaths.includes(location.pathname)) {
      const token = localStorage.getItem("model-base-user-token")
      return !token
    }
    return false
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider navigate={navigate}>
        <div className='min-h-screen'>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/ai' element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <AIHomePage />}>
              <Route index element={<Navigate to='management' replace />} />
            </Route>
            <Route path='/login' element={<LoginPage />} />
            <Route
              path='/form-preview/:templateId'
              element={
                <div className='h-screen overflow-auto'>
                  <FormPreview />
                </div>
              }
            />
            <Route path='/form/:formId' element={<Form />} />
            <Route path='/form-create/:templateId' element={<FormCreate />} />
            <Route path='/report/:reportId' element={<Report />} />
            <Route path='/apps/:appId' element={<AppEntry />} />
            <Route path='/forms/:id' element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <FormRenderer />} />
            <Route
              path='/forms/analysis'
              element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <AnalysisPage />}
            />
            <Route
              path='/resources/view/:id'
              element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <ResourceDataTable />}
            />
            <Route
              path='/reports/create'
              element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <CreateReportPage />}
            />
            <Route
              path='/reports/view/:id'
              element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <ReadReportRenderer />}
            />
            <Route
              path='/operations/wait-list'
              element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <WaitListPage />}
            />
            {renderWeChatApp()}
          </Routes>
          <Toaster />
        </div>
      </NextUIProvider>
    </QueryClientProvider>
  )
}

export default App
