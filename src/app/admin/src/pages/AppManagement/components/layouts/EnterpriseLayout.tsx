import React from "react"
import { Outlet, useParams } from "react-router-dom"
import { Navbar, NavbarBrand, NavbarContent, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useAppStore } from "../../store/useAppStore"
import Sidebar, { SidebarItem } from "@/app/admin/src/component/Sidebar"

export const EnterpriseLayout: React.FC = () => {
  const { appId } = useParams<{ appId: string }>()
  const { useApps } = useAppStore()
  const { apps } = useApps()
  const app = apps.find((a) => a.id === appId)
  const [selectedKey, setSelectedKey] = React.useState("")

  if (!app) return null

  // 构建侧边栏菜单项
  const sidebarItems: SidebarItem[] = [
    // 表单分组
    {
      key: "forms",
      title: "表单管理",
      icon: "mdi:form-select",
      items:
        app.indexFields?.templateIds?.map((templateId, index) => ({
          key: `form-${templateId}`,
          title: `表单 ${index + 1}`,
          icon: "mdi:file-document-outline",
          href: `/apps/${appId}/forms/${templateId}`,
        })) || [],
    },
    // 报表分组
    {
      key: "reports",
      title: "报表管理",
      icon: "mdi:chart-box",
      items:
        app.indexFields?.reportIds?.map((reportId, index) => ({
          key: `report-${reportId}`,
          title: `报表 ${index + 1}`,
          icon: "mdi:chart-line",
          href: `/apps/${appId}/reports/${reportId}`,
        })) || [],
    },
  ]

  return (
    <div className='min-h-screen flex flex-col'>
      {/* 顶部导航栏 */}
      <Navbar maxWidth='full' className='border-b'>
        <NavbarBrand>
          <div className='flex items-center gap-2'>
            <Icon icon='mdi:apps' className='w-6 h-6 text-primary' />
            <span className='font-bold text-inherit'>{app.title}</span>
          </div>
        </NavbarBrand>
        <NavbarContent justify='end'>
          <Button variant='light' startContent={<Icon icon='mdi:cog' />}>
            设置
          </Button>
        </NavbarContent>
      </Navbar>

      {/* 主要内容区域 */}
      <div className='flex flex-1 overflow-hidden'>
        {/* 侧边栏 */}
        <div className='w-64 border-r border-divider bg-content1'>
          <Sidebar
            items={sidebarItems}
            defaultSelectedKey={selectedKey}
            onSelect={(key) => setSelectedKey(key)}
            className='p-2'
          />
        </div>

        {/* 内容区域 */}
        <main className='flex-1 overflow-auto p-4 bg-background'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default EnterpriseLayout
