import { useEffect } from "react"
import { Navigate, useRoutes, useNavigate, useLocation } from "react-router-dom"
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
import UnauthorizedPage from "./permissions/pages/UnauthorizedPage"
import PagePreview from "./pages/app-management/components/PagePreview"
import PreviewPage from "./pages/app-builder/components/PreviewPage"

import { loadBMapScript } from "@/components/reports/MapComponent"

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

  const element = useRoutes([
    { path: "/", element: <LandingPage /> },
    {
      path: "/ai",
      element: shouldRedirectToLogin() ? <Navigate to='/external-login' /> : <AIHomePage />,
      children: [
        { index: true, element: <Navigate to='management' replace /> }
      ]
    },
    { path: "/login", element: <WeChatLoginPage /> },
    { path: "/external-login", element: <ExternalLoginPage /> },
    {
      path: "/form-preview/:templateId",
      element: (
        <div className='h-screen overflow-auto'>
          <FormPreview />
        </div>
      )
    },
    { path: "/form/:formId", element: <Form /> },
    {
      path: "/form-create/:templateId",
      element: (
        <PermissionCheck
          resourceType='template'
          resourceId={location.pathname.split("/").pop() || ""}
          role='creator'
        >
          <FormCreate />
        </PermissionCheck>
      )
    },
    { path: "/report/:reportId", element: <Report /> },
    {
      path: "/apps/:appId/*",
      element: <AppEntry />,
      children: [
        {
          path: "enterprise/*",
          element: (
            <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
              <EnterpriseLayout />
            </PermissionCheck>
          )
        }
      ]
    },
    {
      path: "/forms/analysis",
      element: shouldRedirectToLogin() ? <Navigate to='/login' /> : <AnalysisPage />
    },
    {
      path: "/resources/view/:id",
      element: shouldRedirectToLogin() ? <Navigate to='/login' /> : <ResourceDataTable />
    },
    { path: "/unauthorized", element: <UnauthorizedPage /> },
    {
      path: "/operations/wait-list",
      element: shouldRedirectToLogin() ? <Navigate to='/login' /> : <WaitListPage />
    },
    ...renderWeChatApp(),
    {
      path: "/apps/:appId/pages/:pageId",
      element: (
        <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
          <PagePreview />
        </PermissionCheck>
      )
    },
    {
      path: "/preview/:appId",
      element: <PreviewPage />
    }
  ])

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider navigate={navigate}>
        <div className='min-h-screen'>
          {element}
          <Toaster />
        </div>
      </NextUIProvider>
    </QueryClientProvider>
  )
}

export default App