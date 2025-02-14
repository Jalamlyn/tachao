import { useEffect, useState } from "react"
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
import ErrorPage from "./app/admin/ErrorPage"
import WaitListPage from "./pages/WaitListPage"
import RegisterPage from "./app/landing/src/RegisterPage"
import { Modal, ModalContent } from "@nextui-org/react"
import { localDB } from "./utils/localDB"

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
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const currentLang = getCurrentLanguage()
    i18n.changeLanguage(currentLang)
  }, [])

  useEffect(() => {
    // 监听登录框显示状态
    const unwatch = localDB.watchKey("global:showLoginModal", (value) => {
      setShowLoginModal(!!value)
    })

    return () => unwatch()
  }, [])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    localDB.setItem("global:loginSuccess", true)
    // 清理临时数据
    localDB.removeItem("global:pendingRequest")
    localDB.removeItem("global:showLoginModal")
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider navigate={navigate}>
        <div className='min-h-screen'>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/unauthorized' element={<UnauthorizedPage />} />
            <Route path='error' element={<ErrorPage />} />

            <Route path='/operations/wait-list' element={<WaitListPage />} />
            {AdminRouter()}
          </Routes>
          <Toaster />

          {/* 全局登录Modal */}
          <Modal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            size='2xl'
            classNames={{
              backdrop: "backdrop-blur-sm",
              base: "border border-white/30 p-4",
            }}
          >
            <ModalContent>
              <LoginPage isModal onSuccess={handleLoginSuccess} />
            </ModalContent>
          </Modal>
        </div>
      </NextUIProvider>
    </QueryClientProvider>
  )
}

export default App
