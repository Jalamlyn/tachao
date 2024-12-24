export type ResourceType = "app" | "form" | "report" | "page" | "resource" | "template"

export type TemplatePermissionRole = "creator" | "editor" | "viewer"

export interface PermissionAccount {
  accountId: string
  role: string[] | string
  grantedAt: string
  grantedBy: string
}

export interface Permission {
  resourceType: ResourceType
  resourceId: string
  accounts: PermissionAccount[]
}

export interface PermissionMetadata {
  [resourceId: string]: Permission
}

export interface UsePermissionsReturn {
  getPermissions: (resourceId: string) => Promise<Permission | null>
  checkPermission: (resourceId: string, accountId: string) => Promise<boolean>
  grantPermission: (resourceId: string, accountId: string, role: string | string[]) => Promise<void>
  revokePermission: (resourceId: string, accountId: string) => Promise<void>
  loading: boolean
  error: Error | null
}

// 订阅相关类型定义
export type SubscriptionType = 'personal' | 'enterprise' | 'custom'
export type SubscriptionStatus = 'active' | 'expired' | 'warning'

export interface SubscriptionFeatures {
  nbAccountLimit: number
  tokenAmount: number
}

export interface Subscription {
  organizationId: string
  type: SubscriptionType
  status: SubscriptionStatus
  startDate: string
  expireDate: string
  features: SubscriptionFeatures
  price: number
}

export interface SubscriptionHistory {
  type: SubscriptionType
  price: number
  purchaseDate: string
  expireDate: string
}

export interface AccountUsage {
  organizationId: string
  accounts: Array<{
    accountId: string
    name: string
    type: 'admin' | 'nb' | 'wb'
    createdAt: string
  }>
}