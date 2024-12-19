export type ResourceType = 'app' | 'form' | 'report';

export interface PermissionAccount {
  accountId: string;
  role: string;
  grantedAt: string;
  grantedBy: string;
}

export interface Permission {
  resourceType: ResourceType;
  resourceId: string;
  accounts: PermissionAccount[];
}

export interface PermissionMetadata {
  [resourceId: string]: Permission;
}

export interface UsePermissionsReturn {
  getPermissions: (resourceId: string) => Promise<Permission | null>;
  checkPermission: (resourceId: string, accountId: string) => Promise<boolean>;
  grantPermission: (resourceId: string, accountId: string, role: string) => Promise<void>;
  revokePermission: (resourceId: string, accountId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}