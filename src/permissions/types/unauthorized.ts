export interface UnauthorizedContentProps {
  resourceId: string
  onBack?: () => void
  onRequestAccess?: () => void
}

export interface ResourceTypeContent {
  title: string
  description: string
  icon: string
  actions: {
    primary?: {
      label: string
      action: () => void
    }
    secondary?: {
      label: string
      action: () => void
    }
  }
}
