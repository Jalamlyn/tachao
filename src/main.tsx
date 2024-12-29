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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// 配置 MobX
configure({
  enforceActions: "observed",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
})

// 通用的 URL 解析函数
const getAppIdFromUrl = (prefix: string): string | null => {
  try {
    const url = new URL(window.location.href)
    const pathSegments = url.pathname.split("/")
    const prefixIndex = pathSegments.indexOf(prefix)
    if (prefixIndex !== -1 && pathSegments[prefixIndex + 1]) {
      return pathSegments[prefixIndex + 1]
    }
    return null
  } catch (error) {
    console.error("Error parsing URL:", error)
    return null
  }
}

const AppSelector: React.FC = () => {
  const pathname = window.location.pathname

  // 预览模式 - /app-preview/:appId
  if (pathname.startsWith("/app-preview/")) {
    const appId = getAppIdFromUrl("app-preview")
    if (!appId) {
      return <div className='text-danger p-4'>无效的应用ID</div>
    }
    return (
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <PreviewPage appId={appId} />
        </QueryClientProvider>
      </StoreProvider>
    )
  }

  // 运行时模式 - /app-run/:appId
  if (pathname.startsWith("/app-run/")) {
    const appId = getAppIdFromUrl("app-run")
    if (!appId) {
      return <div className='text-danger p-4'>无效的应用ID</div>
    }

    return (
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <Provider>
            <AppRuntime appId={appId} />
          </Provider>
        </QueryClientProvider>
      </StoreProvider>
    )
  }

  // 主应用
  return (
    <BrowserRouter>
      <StoreProvider>
        <Provider>
          <Routes>
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
