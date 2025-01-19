import { useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import { useTranslation } from "react-i18next"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getCurrentLanguage } from "./i18n"
import LoginPage from "./pages/login"
import { Toaster } from "./components/ui/toaster"
import { loadBMapScript } from "@/components/reports/MapComponent"
import LandingPage from "./app/landing/App"
import AdminRouter from "./app/admin/router"
import UnauthorizedPage from "./app/admin/src/permissions/pages/UnauthorizedPage"
import { Provider } from "./provider"
import ErrorPage from "./app/admin/ErrorPage"
import WaitListPage from "./pages/WaitListPage"

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

  useEffect(() => {
    const currentLang = getCurrentLanguage()
    i18n.changeLanguage(currentLang)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider navigate={navigate}>
        <div className='min-h-screen'>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/unauthorized' element={<UnauthorizedPage />} />
            <Route path='error' element={<ErrorPage />} />

            <Route path='/operations/wait-list' element={<WaitListPage />} />
            {AdminRouter()}
          </Routes>
          <Toaster />
        </div>
      </NextUIProvider>
    </QueryClientProvider>
  )
}

export default App
