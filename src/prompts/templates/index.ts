import { markdown as entry } from "./crm/app/entry.md"
import { markdown as sidebarDrawer } from "./crm/components/sidebar-drawer.md"
import { markdown as sidebar } from "./crm/components/sidebar.md"
import { markdown as storeData } from "./crm/store/storeData.md"
// 业务应用模板 - 面向非技术用户的示例
export const templates = [
  {
    id: "basic",
    name: "客户管理系统",
    description: "简单易用的客户信息管理应用模板",
    template: () => {
      return `
      ${entry}
      ${sidebarDrawer}
      ${sidebar}
      ${storeData}
      `
    },
  },
]
