import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "./provider"
import "./styles/globals.css"
import "./styles/github-markdown.css"
import { Toaster } from "sonner"
import "./i18n"
import "./tools"
import { configure } from "mobx"
import { StoreProvider } from "./stores/StoreProvider"
import AppRuntime from "./app/admin/src/pages/AppBuilder/components/AppRuntime"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LoginPage from "./pages/login"
import { BrowserRouter } from "react-router-dom"

// 动态加载 CloudBase SDK 并初始化
function loadCloudBaseSDK() {
  return new Promise((resolve, reject) => {
    // 创建一个 <script> 元素
    const script = document.createElement("script")
    script.src = "https://static.cloudbase.net/cloudbase-js-sdk/2.7.12-beta.0/cloudbase.full.js"
    script.async = true

    // 设置脚本加载完成后的回调
    script.onload = () => {
      // 确保 cloudbase 全局对象存在
      window.app = cloudbase.init({
        env: "mobenai-weapp-dev-2e8qhi3a963364", // 替换为你的云开发环境 ID
        clientId: "mobenai-weapp-dev-2e8qhi3a963364", // 替换为你的云开发环境 ID
      })
    }

    // 处理加载错误
    script.onerror = () => reject(new Error("加载 CloudBase SDK 时出错"))

    // 将 script 标签添加到页面 <head>
    document.head.appendChild(script)
  })
}

// 使用动态加载的函数
loadCloudBaseSDK()
  .then((app) => {
    console.log("CloudBase SDK 加载成功并初始化完成", app)
    // 在这里可以继续使用 app 对象
  })
  .catch((err) => {
    console.error("加载或初始化失败:", err)
  })

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
  const pathname = window.location.pathname
  if (pathname.startsWith("/login")) {
    return (
      <BrowserRouter>
        <StoreProvider>
          <LoginPage></LoginPage>
          <Toaster position='top-center' expand={true} richColors closeButton />
        </StoreProvider>
      </BrowserRouter>
    )
  }
  // 主应用
  const appId = "app_1_1867924698052419585_1739478553889_r29vew"
  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <AppRuntime appId={appId} />
          <Toaster position='top-center' expand={true} richColors closeButton />
        </Provider>
      </QueryClientProvider>
    </StoreProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<AppSelector></AppSelector>)
