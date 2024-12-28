// main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Provider } from "./provider"
import App from "./App"
import "./styles/globals.css"
import "./styles/github-markdown.css"
import { Toaster } from "sonner"
import "./i18n"
import "./tools"
import { configure } from "mobx"
import { StoreProvider } from "./stores/StoreProvider"
import RechargeModal from "./components/RechargeModal"
import PreviewPage from "./pages/app-builder/components/PreviewPage"
import AppRuntime from "./pages/app-builder/components/AppRuntime"

// 配置 MobX
configure({
  enforceActions: "observed",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
})

const AppSelector: React.FC = () => {
  const pathname = window.location.pathname

  // 如果路径以 /app 开头，渲染应用构建器
  // 预览模式
  if (pathname.startsWith("/app-preview/")) {
    return (
      <StoreProvider>
        <PreviewPage />
      </StoreProvider>
    )
  }

  // 运行时模式
  if (pathname.startsWith("/app-run/")) {
    return (
      <StoreProvider>
        <AppRuntime />
      </StoreProvider>
    )
  }

  // 主应用，包含根路径重定向
  return (
    <BrowserRouter>
      <StoreProvider>
        <Provider>
          <Routes>
            {/* 其他路由 */}
            <Route path='/*' element={<App />} />
          </Routes>
          <Toaster position='top-center' expand={true} richColors closeButton />
          <RechargeModal />
        </Provider>
      </StoreProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<AppSelector />)
