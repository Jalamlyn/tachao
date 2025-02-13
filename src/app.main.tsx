import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { Provider } from "./provider"
import { StoreProvider } from "./stores/StoreProvider"
import AppRuntime from "./app/admin/src/pages/AppBuilder/components/AppRuntime"
import "./styles/globals.css"
import "./styles/github-markdown.css"
import "./i18n"
import "./tools"
import { configure } from "mobx"

// 配置 MobX
configure({
  enforceActions: "never",
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
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

const AppRuntimeWrapper: React.FC = () => {
  const appId = window.mo_appId

  if (!appId) {
    return <div className='text-danger p-4'>无效的应用ID</div>
  }

  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <AppRuntime appId={appId} />
        <Toaster position='top-center' expand={true} richColors closeButton />
      </QueryClientProvider>
    </StoreProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<AppRuntimeWrapper />)
