import { useEffect } from "react"
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import { useTranslation } from "react-i18next"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getCurrentLanguage } from "./i18n"
import WeChatLoginPage from "./pages/LoginPage"
import ExternalLoginPage from "./pages/external-login"
import AnalysisPage from "./pages/AnalysisPage"
import { Toaster } from "./components/ui/toaster"
import LandingPage from "./pages/landing"
import AIHomePage from "./pages/AIHomePage"
import renderWeChatApp from "./apps/we-chat-app-admin/renderWeChatApp"
import FormPreview from "./pages/form-temp-manager/components/FormPreview"
import Form from "@/pages/form"
import Report from "@/pages/report"
import ResourceDataTable from "./components/common/data-table/ResourceDataTable"
import AppEntry from "./pages/app-management/components/AppEntry"
import EnterpriseLayout from "./pages/app-management/components/layouts/EnterpriseLayout"
import WaitListPage from "./pages/WaitListPage"
import FormCreate from "./pages/form/components/FormCreate"
import { PermissionCheck } from "./permissions/components/PermissionCheck"
import PageEditor from "./pages/app-management/components/PageEditor"
import UnauthorizedPage from "./permissions/pages/UnauthorizedPage"

import { loadBMapScript } from "@/components/reports/MapComponent"
import { BreadcrumbProvider } from "./contexts/BreadcrumbContext"

setTimeout(() => {
  loadBMapScript()
}, 5000)

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
    const publicPaths = ["/", "/login", "/external-login"]
    if (!publicPaths.includes(location.pathname)) {
      const token = localStorage.getItem("model-base-user-token")
      return !token
    }
    return false
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider navigate={navigate}>
        <BreadcrumbProvider>
          <div className='min-h-screen'>
            <Routes>
              <Route path='/' element={<LandingPage />} />
              <Route path='/ai' element={shouldRedirectToLogin() ? <Navigate to='/external-login' /> : <AIHomePage />}>
                <Route index element={<Navigate to='management' replace />} />
              </Route>
              <Route path='/login' element={<WeChatLoginPage />} />
              <Route path='/external-login' element={<ExternalLoginPage />} />
              <Route
                path='/form-preview/:templateId'
                element={
                  <div className='h-screen overflow-auto'>
                    <FormPreview />
                  </div>
                }
              />
              <Route path='/form/:formId' element={<Form />} />
              <Route
                path='/form-create/:templateId'
                element={
                  <PermissionCheck
                    resourceType='template'
                    resourceId={location.pathname.split("/").pop() || ""}
                    role='creator'
                  >
                    <FormCreate />
                  </PermissionCheck>
                }
              />
              <Route path='/report/:reportId' element={<Report />} />
              <Route path='/apps/:appId' element={<AppEntry />}>
                <Route
                  path='enterprise/*'
                  element={
                    <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
                      <EnterpriseLayout />
                    </PermissionCheck>
                  }
                />
              </Route>
              {/* 新增页面编辑器路由 */}
              <Route
                path='/apps/:appId/pages/create'
                element={
                  <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
                    <PageEditor />
                  </PermissionCheck>
                }
              />
              <Route
                path='/forms/analysis'
                element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <AnalysisPage />}
              />
              <Route
                path='/resources/view/:id'
                element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <ResourceDataTable />}
              />
              <Route path='/unauthorized' element={<UnauthorizedPage />} />
              <Route
                path='/operations/wait-list'
                element={shouldRedirectToLogin() ? <Navigate to='/login' /> : <WaitListPage />}
              />
              {renderWeChatApp()}
            </Routes>
            <Toaster />
          </div>
        </BreadcrumbProvider>
      </NextUIProvider>
    </QueryClientProvider>
  )
}

export default App
