import React from "react"
import ReactDOM from "react-dom/client"
import "./styles/globals.css"
import "./styles/github-markdown.css"
import { Toaster } from "sonner"
import { configure } from "mobx"
import { StoreProvider } from "./lib/StoreProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./module/importing"
import App from "./module/App"
import { BrowserRouter } from "react-router-dom"
import cloudbase from "@cloudbase/js-sdk"

async function loadCloudBaseSDK() {
  // 引入 SDK
  const app = cloudbase.init({
    env: "mobenai-weapp-dev-2e8qhi3a963364", // 替换为你的云开发环境 ID
    clientId: "mobenai-weapp-dev-2e8qhi3a963364", // 替换为你的云开发环境 ID
  })
  window.mo_app = app
  const auth = app.auth({
    persistence: "local",
  })
  await auth.signInAnonymously() // 或者使用其他登录方式
}

loadCloudBaseSDK()

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
  enforceActions: "never",
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
})

const AppSelector: React.FC = () => {
  // 主应用
  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App></App>
        </BrowserRouter>
        <Toaster position='top-center' expand={true} richColors closeButton />
      </QueryClientProvider>
    </StoreProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<AppSelector></AppSelector>)
