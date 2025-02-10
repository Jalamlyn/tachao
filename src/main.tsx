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
import PreviewPage from "./app/admin/src/pages/AppBuilder/components/PreviewPage"
import AppRuntime from "./app/admin/src/pages/AppBuilder/components/AppRuntime"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

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
          <Toaster position='top-center' expand={true} richColors closeButton />
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
            <Toaster position='top-center' expand={true} richColors closeButton />
          </Provider>
        </QueryClientProvider>
      </StoreProvider>
    )
  }

  // 主应用
  return (
    <BrowserRouter>
      <StoreProvider>
        <App />
        <Toaster position='top-center' expand={true} richColors closeButton />
      </StoreProvider>
    </BrowserRouter>
  )
}
window.test = () => {
  async function getNativePayQrCode(orderId, amount) {
    try {
      const result = await app.callFunction({
        name: "native-pay-qr-code",
        data: {
          orderId,
          amount,
        },
      })

      if (result.result.code === 0) {
        return result.result.data.qrCodeUrl
      } else {
        throw new Error(result.result.msg)
      }
    } catch (error) {
      console.error("调用云函数失败:", error)
      throw error
    }
  }

  // 示例调用
  debugger
  getNativePayQrCode("123456", 100)
    .then((qrCodeUrl) => {
      console.log("支付二维码链接:", qrCodeUrl)
      // 在网页中显示二维码
      const img = document.createElement("img")
      img.src = qrCodeUrl
      document.body.appendChild(img)
    })
    .catch((error) => {
      console.error("生成支付二维码失败:", error)
    })
}
ReactDOM.createRoot(document.getElementById("root")!).render(<AppSelector></AppSelector>)
