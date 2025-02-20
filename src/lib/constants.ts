import { TemplatePermissionRole } from "./type-index"

export const PERMISSION_ROLES = {
  CREATOR: "creator",
  EDITOR: "editor",
  VIEWER: "viewer"
} as const

export const PERMISSION_LABELS = {
  [PERMISSION_ROLES.CREATOR]: "创建",
  [PERMISSION_ROLES.EDITOR]: "编辑",
  [PERMISSION_ROLES.VIEWER]: "查看"
} as const

export const PERMISSION_DESCRIPTIONS = {
  [PERMISSION_ROLES.CREATOR]: "填写新表单权限（包含编辑和查看权限）",
  [PERMISSION_ROLES.EDITOR]: "编辑权限（包含查看权限）",
  [PERMISSION_ROLES.VIEWER]: "查看权限"
} as const

export const PERMISSION_CHIPS = {
  [PERMISSION_ROLES.CREATOR]: {
    color: "warning" as const,
    label: "创建"
  },
  [PERMISSION_ROLES.EDITOR]: {
    color: "secondary" as const,
    label: "编辑"
  },
  [PERMISSION_ROLES.VIEWER]: {
    color: "default" as const,
    label: "查看"
  }
} as const

export const PERMISSION_HIERARCHY = {
  [PERMISSION_ROLES.CREATOR]: [PERMISSION_ROLES.CREATOR, PERMISSION_ROLES.EDITOR, PERMISSION_ROLES.VIEWER],
  [PERMISSION_ROLES.EDITOR]: [PERMISSION_ROLES.EDITOR, PERMISSION_ROLES.VIEWER],
  [PERMISSION_ROLES.VIEWER]: [PERMISSION_ROLES.VIEWER]
} as const

export const hasRequiredPermission = (userRoles: string[], requiredRole: TemplatePermissionRole): boolean => {
  const requiredRoles = PERMISSION_HIERARCHY[requiredRole]
  return userRoles.some(role => requiredRoles.includes(role as TemplatePermissionRole))
}