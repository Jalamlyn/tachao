import { lazy } from "react"
import { RouteObject } from "react-router-dom"
import App from "../App"

const Applications = lazy(() => import("@/pages/Applications"))
const FormTempManager = lazy(() => import("@/pages/FormTempManager"))
const AIFormEditor = lazy(() => import("@/pages/FormTempManager/AIFormEditor"))
const FormManager = lazy(() => import("@/pages/FormManager"))
const Settings = lazy(() => import("@/pages/Settings"))

export const routes: RouteObject[] = [
  {
    path: "/we-chat-app/admin",
    element: <App />,
    children: [
      {
        path: "applications",
        element: <Applications />,
      },
      {
        path: "documents",
        element: <FormTempManager />,
      },
      {
        path: "documents/create",
        element: <AIFormEditor />,
      },
      {
        path: "documents/edit/:templateId",
        element: <AIFormEditor />,
      },
      // 新增单据管理相关路由
      {
        path: "forms",
        element: <FormManager />,
      },
      {
        path: "forms/:formId",
        element: <FormManager />,
      },
      {
        path: "forms/edit/:formId",
        element: <FormManager />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "",
        element: <Applications />,
      },
    ],
  },
]

export default routes