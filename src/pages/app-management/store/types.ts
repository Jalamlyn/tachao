export interface AppIndex {
  id: string
  title: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  template?: "default" | "dashboard"
  indexFields?: {
    templateIds: string[]
    reportIds: string[]
  }
}

export interface CreateAppInput {
  title: string
  description?: string
}

export interface UpdateAppConfigInput {
  templateIds: string[]
  reportIds: string[]
  template?: "default" | "dashboard"
}

export interface AppUISlice {
  isCreateModalOpen: boolean
  isDevelopModalOpen: boolean
  selectedApp: AppIndex | null
  isDeleteModalOpen: boolean
  appToDelete: AppIndex | null
  setCreateModalOpen: (isOpen: boolean) => void
  setDevelopModalOpen: (isOpen: boolean) => void
  setSelectedApp: (app: AppIndex | null) => void
  setDeleteModalOpen: (isOpen: boolean) => void
  setAppToDelete: (app: AppIndex | null) => void
  reset: () => void
}

export interface AppDataSlice {
  useApps: () => {
    apps: AppIndex[]
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<void>
  }
  useCreateApp: () => {
    createApp: (input: CreateAppInput) => Promise<void>
    isCreating: boolean
    error: Error | null
  }
  useUpdateAppConfig: () => {
    updateAppConfig: ({ appId, input }: { appId: string; input: UpdateAppConfigInput }) => Promise<void>
    isUpdating: boolean
    error: Error | null
  }
  useDeleteApp: () => {
    deleteApp: (appId: string) => Promise<void>
    isDeleting: boolean
    error: Error | null
  }
}

export type AppStore = AppUISlice & AppDataSlice