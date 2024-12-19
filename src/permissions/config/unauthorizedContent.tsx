import { ResourceType } from "../types"
import { ResourceTypeContent } from "../types/unauthorized"
import { TemplatePermissionRole } from "../types"
import { useNavigate } from "react-router-dom"
import { PERMISSION_LABELS } from "./constants"

export const getUnauthorizedContent = (
  type: ResourceType,
  resourceId: string,
  handlers: {
    onRequestAccess?: () => void
    onBack?: () => void
  },
  role?: TemplatePermissionRole
): ResourceTypeContent => {
  const navigate = useNavigate()
  const contents: Record<ResourceType, (id: string) => ResourceTypeContent> = {
    app: (id) => ({
      title: "应用访问受限",
      description: "您没有访问此应用的权限，请联系管理员或申请访问权限。",
      icon: "solar:shield-cross-bold-duotone",
      actions: {
        primary: {
          label: "申请访问权限",
          action: handlers.onRequestAccess || (() => {}),
        },
        secondary: {
          label: "返回应用列表",
          action: () => navigate("/apps"),
        },
      },
    }),
    form: (id) => ({
      title: "表单访问受限",
      description: "您需要相应权限才能访问此表单。",
      icon: "solar:file-block-bold-duotone",
      actions: {
        primary: {
          label: "申请表单权限",
          action: handlers.onRequestAccess || (() => {}),
        },
        secondary: {
          label: "浏览其他表单",
          action: () => navigate("/documents"),
        },
      },
    }),
    template: (id) => ({
      title: "表单模板访问受限",
      description: role
        ? `您没有${PERMISSION_LABELS[role]}此表单模板的权限，请申请相应权限。`
        : "您没有访问此表单模板的权限，请申请相应权限。",
      icon: "solar:file-shield-cross-bold-duotone",
      actions: {
        primary: {
          label: role ? `申请${PERMISSION_LABELS[role]}权限` : "申请访问权限",
          action: handlers.onRequestAccess || (() => {}),
        },
        secondary: {
          label: "返回模板列表",
          action: () => navigate("/we-chat-app/admin/documents"),
        },
      },
      metadata: {
        role: role || "viewer", // 默认为查看权限
      },
    }),
    report: (id) => ({
      title: "报表访问受限",
      description: "您没有查看此报表的权限。",
      icon: "solar:chart-bold-duotone",
      actions: {
        primary: {
          label: "申请报表权限",
          action: handlers.onRequestAccess || (() => {}),
        },
        secondary: {
          label: "查看其他报表",
          action: () => navigate("/reports"),
        },
      },
    }),
    page: (id) => ({
      title: "页面访问受限",
      description: "您没有访问此页面的权限。",
      icon: "solar:prohibited-bold-duotone",
      actions: {
        primary: {
          label: "返回首页",
          action: () => navigate("/"),
        },
        secondary: {
          label: "返回上一页",
          action: handlers.onBack || (() => {}),
        },
      },
    }),
    resource: (id) => ({
      title: "资源访问受限",
      description: "您没有访问此资源的权限。",
      icon: "solar:lock-bold-duotone",
      actions: {
        primary: {
          label: "申请资源权限",
          action: handlers.onRequestAccess || (() => {}),
        },
        secondary: {
          label: "浏览其他资源",
          action: () => navigate("/resources"),
        },
      },
    }),
  }

  return contents[type](resourceId)
}