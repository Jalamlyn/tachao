import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { Provider } from "./provider"
import "./styles/globals.css"
import "./styles/github-markdown.css"
import { Toaster } from "sonner"
import "./i18n"
import "./tools"
import { configure } from "mobx"
import { StoreProvider } from "./stores/StoreProvider"
import RechargeModal from "./components/RechargeModal"

// 配置 MobX
configure({
  enforceActions: "observed",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <BrowserRouter>
    <StoreProvider>
      <Provider>
        <App />
        <Toaster position='top-center' expand={true} richColors closeButton></Toaster>
        <RechargeModal></RechargeModal>
      </Provider>
    </StoreProvider>
  </BrowserRouter>
  // </React.StrictMode>
)
