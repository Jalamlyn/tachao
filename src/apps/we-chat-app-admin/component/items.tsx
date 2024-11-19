import { type SidebarItem } from "./sidebar"

export const items: SidebarItem[] = [
  {
    key: "documents",
    href: "/we-chat-app/admin/documents",
    icon: "solar:document-outline",
    title: "表单模板管理",
  },
  {
    key: "forms",
    href: "/we-chat-app/admin/forms",
    icon: "solar:document-text-line-duotone",
    title: "表单管理",
  },
  {
    key: "reports",
    href: "/we-chat-app/admin/reports",
    icon: "mdi:chart-box-outline",
    title: "报表管理",
  },
  {
    key: "resources",
    href: "/we-chat-app/admin/resources",
    icon: "mdi:file-document",
    title: "表格管理",
  },
  {
    key: "ai-assistant",
    href: "/we-chat-app/admin/ai-assistant",
    icon: "hugeicons:ai-chat-02",
    title: "AI 智能助手",
  },
  {
    key: "settings",
    href: "/we-chat-app/admin/settings",
    icon: "solar:settings-outline",
    title: "企业设置",
  },
]
