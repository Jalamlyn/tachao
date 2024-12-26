import { type SidebarItem } from "./sidebar"

export const items: SidebarItem[] = [
  {
    key: "apps",
    href: "/we-chat-app/admin/apps",
    icon: "mdi:apps",
    title: "应用管理",
  },
  {
    key: "documents",
    href: "/we-chat-app/admin/documents",
    icon: "solar:document-outline",
    title: "表单模板管理",
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
    title: "资料表格管理",
  },
  {
    key: "forms",
    href: "/we-chat-app/admin/forms",
    icon: "solar:document-text-line-duotone",
    title: "表单管理",
  },
  {
    key: "pending-tasks",
    href: "/we-chat-app/admin/pending-tasks",
    icon: "solar:list-check-bold",
    title: "待我处理",
  },
  {
    key: "file-manager",
    href: "/we-chat-app/admin/file-manager",
    icon: "solar:folder-with-files-bold-duotone",
    title: "企业网盘",
  },
  {
    key: "ai-assistant",
    href: "/we-chat-app/admin/ai-assistant",
    icon: "hugeicons:ai-chat-02",
    title: "AI 数据分析",
  },
  {
    key: "settings",
    href: "/we-chat-app/admin/settings",
    icon: "solar:settings-outline",
    title: "企业设置",
  },
]
