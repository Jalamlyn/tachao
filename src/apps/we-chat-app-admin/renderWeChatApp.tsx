import AdminPage from "@/apps/we-chat-app-admin/src/App"
import EnterpriseSettings from "@/apps/we-chat-app-admin/src/EnterpriseSettings"
import FormTempManager from "@/pages/form-temp-manager"
import FormManager from "@/pages/form-manager"
import FormPreview from "@/pages/form-temp-manager/components/FormPreview"
import AIFormEditor from "@/pages/form-temp-manager/AIFormEditor"
import FormDataManager from "@/pages/form-temp-manager/FormDataManager"
import FormAnalysis from "@/pages/form-analysis/FormAnalysis"
import ResourceManagement from "@/pages/resource-management"
import ResourceDetail from "@/pages/resource-management/ResourceDetail"
import ReportManagement from "@/pages/report-management"
import AIReportEditor from "@/pages/report-management/AIReportEditor"
import Dashboard from "@/apps/we-chat-app-admin/src/Dashboard"
import AppManagement from "@/pages/app-management"
import PendingTasks from "@/pages/pending-tasks"
import FileManager from "@/apps/we-chat-app-admin/src/FileManager"
import { PermissionCheck } from "@/permissions/components/PermissionCheck"
import PageEditor from "@/pages/app-management/components/PageEditor"
import PagePreview from "@/pages/app-management/components/PagePreview"
import AppBuilder from "@/pages/app-builder/AppEdit"

export default function renderWeChatApp() {
  return [
    {
      path: "/we-chat-app/admin",
      element: (
        <PermissionCheck resourceType='page' resourceId='/we-chat-app/admin'>
          <AdminPage />
        </PermissionCheck>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        { path: "settings", element: <EnterpriseSettings /> },
        { path: "documents", element: <FormTempManager /> },
        { path: "forms", element: <FormManager /> },
        { path: "documents/create", element: <AIFormEditor /> },
        { path: "documents/edit/:templateId", element: <AIFormEditor /> },
        { path: "documents/data/:templateId", element: <FormDataManager /> },
        { path: "form-preview/:templateId", element: <FormPreview /> },
        { path: "resources", element: <ResourceManagement /> },
        { path: "resources/:resourceId", element: <ResourceDetail /> },
        { path: "reports", element: <ReportManagement /> },
        { path: "reports/ai/create/:templateId", element: <AIReportEditor /> },
        { path: "reports/ai/:reportId", element: <AIReportEditor /> },
        { path: "ai-assistant", element: <FormAnalysis /> },
        { path: "apps", element: <AppManagement /> },
        { path: "pending-tasks", element: <PendingTasks /> },
        { path: "file-manager", element: <FileManager /> },
        {
          path: "apps/:appId/pages/create",
          element: (
            <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
              <PageEditor />
            </PermissionCheck>
          )
        },
        {
          path: "apps/:appId/pages/:pageId/edit",
          element: (
            <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
              <PageEditor />
            </PermissionCheck>
          )
        },
        {
          path: "apps/:appId/builder",
          element: (
            <PermissionCheck resourceType='app' resourceId={location.pathname.split("/")[2]}>
              <AppBuilder />
            </PermissionCheck>
          )
        }
      ]
    }
  ]
}