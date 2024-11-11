import { type SidebarItem } from "./sidebar"

export const items: SidebarItem[] = [
  {
    key: "documents",
    href: "/we-chat-app/admin/documents",
    icon: "solar:document-outline",
    title: "单据模板管理",
  },
  {
    key: "forms",
    href: "/we-chat-app/admin/forms",
    icon: "solar:document-text-line-duotone",
    title: "单据管理",
  },
  {
    key: "resources",
    href: "/we-chat-app/admin/resources", 
    icon: "mdi:file-document",
    title: "资料管理",
  },
  {
    key: "settings",
    href: "/we-chat-app/admin/settings",
    icon: "solar:settings-outline",
    title: "企业设置",
  },
]