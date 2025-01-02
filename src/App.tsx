import { useEffect } from "react"
import { Navigate, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import { useTranslation } from "react-i18next"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getCurrentLanguage } from "./i18n"
import WeChatLoginPage from "./pages/LoginPage"
import ExternalLoginPage from "./pages/external-login"
import { Toaster } from "./components/ui/toaster"
import AIHomePage from "./pages/AIHomePage"
import FormPreview from "./pages/form-temp-manager/components/FormPreview"
import { loadBMapScript } from "@/components/reports/MapComponent"
import LandingPage from "./app/landing"
import AdminRouter from "./app/admin/router"

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
            {AdminRouter()}
          </Routes>
          <Toaster />
        </div>
      </NextUIProvider>
    </QueryClientProvider>
  )
}

export default App
