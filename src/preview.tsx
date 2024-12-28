import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import PreviewPage from "./pages/app-builder/components/PreviewPage"
import "./styles/globals.css"
import "./styles/github-markdown.css"
import { Toaster } from "sonner"
import "./i18n"
import { configure } from "mobx"
import { StoreProvider } from "./stores/StoreProvider"

// 配置 MobX
configure({
  enforceActions: "observed",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StoreProvider>
      <NextUIProvider>
        <PreviewPage />
        <Toaster position='top-center' expand={true} richColors closeButton />
      </NextUIProvider>
    </StoreProvider>
  </BrowserRouter>
)