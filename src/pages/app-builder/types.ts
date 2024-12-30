export interface AppPages {
  [pageId: string]: {
    code: string
    title: string
    updatedAt: string
  }
}

export interface AppStores {
  [name: string]: {
    code: string
    updatedAt: string
  }
}

export interface AppServices {
  [name: string]: {
    code: string
    updatedAt: string
  }
}

export interface AppModules {
  [name: string]: {
    code: string
    updatedAt: string
  }
}

export interface AppSchemas {
  [name: string]: {
    code: string
    updatedAt: string
  }
}

export interface AppCache {
  [appId: string]: {
    pages: AppPages
    stores: AppStores
    services: AppServices
    modules: AppModules
    schemas: AppSchemas
    appCode: string
    version: number
    updatedAt: string
  }
}

export interface AppBuilderMessage {
  role: "user" | "assistant"
  content: string
  id: string
  timestamp: string
  status?: "success" | "error" | "thinking" | "streaming"
}

export interface AppBuilderVersion {
  appCode: string
  pages: AppPages
  stores?: AppStores
  services?: AppServices
  modules?: AppModules
  schemas?: AppSchemas
  timestamp: string
}