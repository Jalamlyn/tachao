import React from "react"
import { Outlet, useParams } from "react-router-dom"
import { Sidebar, SidebarItem, SidebarBrand, SidebarContent } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useAppStore } from "../../store/useAppStore"

export const EnterpriseLayout: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const { useApps } = useAppStore()
  const { apps } = useApps()
  const app = apps.find(a => a.id === appId)

  if (!app) return null

  return (
    <div className="min-h-screen flex">
      <div className="w-64 border-r border-divider bg-content1">
        <Sidebar>
          <SidebarBrand>
            <div className="flex items-center gap-2 p-4">
              <Icon icon="mdi:apps" className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">{app.title}</h1>
            </div>
          </SidebarBrand>
          <SidebarContent>
            {app.indexFields?.templateIds?.map((templateId, index) => (
              <SidebarItem
                key={templateId}
                startContent={<Icon icon="mdi:form-select" className="w-5 h-5" />}
              >
                表单 {index + 1}
              </SidebarItem>
            ))}
            {app.indexFields?.reportIds?.map((reportId, index) => (
              <SidebarItem
                key={reportId}
                startContent={<Icon icon="mdi:chart-box" className="w-5 h-5" />}
              >
                报表 {index + 1}
              </SidebarItem>
            ))}
          </SidebarContent>
        </Sidebar>
      </div>
      <main className="flex-1 p-4 bg-background">
        <Outlet />
      </main>
    </div>
  )
}

export default EnterpriseLayout