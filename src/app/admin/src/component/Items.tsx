import { type SidebarItem } from "./Sidebar"

export const items: SidebarItem[] = [
  {
    key: "apps",
    href: "/admin/apps",
    icon: "mdi:apps",
    title: "应用管理",
  },
  {
    key: "pending-tasks",
    href: "/admin/pending-tasks",
    icon: "solar:list-check-bold",
    title: "待我处理",
  },
  {
    key: "file-manager",
    href: "/admin/file-manager",
    icon: "solar:folder-with-files-bold-duotone",
    title: "企业网盘",
  },
  {
    key: "settings",
    href: "/admin/settings",
    icon: "solar:settings-outline",
    title: "企业设置",
  },
]
