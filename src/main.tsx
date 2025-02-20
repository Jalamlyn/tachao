import React from "react"
import ReactDOM from "react-dom/client"
import "./styles/globals.css"
import "./styles/github-markdown.css"
import { Toaster } from "sonner"
import { configure } from "mobx"
import { StoreProvider } from "./lib/StoreProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "./importing"
import App from "./App"
import { BrowserRouter } from "react-router-dom"

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
