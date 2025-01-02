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

export interface AppCache {
  [appId: string]: {
    pages: AppPages
    stores: AppStores
    services: AppServices
    modules: AppModules
    appCode: string
    version: number
    updatedAt: string
    cachedAt: string
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
  timestamp: string
  version: number
  updatedAt: string
}

export interface CodeItem {
  id: string
  title: string
  type: "app" | "page" | "store" | "service" | "module"
  code: string
  updatedAt?: string
  name?: string
  isPublic?: boolean
}

export interface PublishData {
  appCode: string
  pages: AppPages
  stores: AppStores
  services: AppServices
  modules: AppModules
  version: number
  updatedAt: string
}

export interface CacheConfig {
  maxAge: number // 缓存最大保存时间(毫秒)
  version: string // 缓存版本号
  prefix: string // 缓存key前缀
}

export interface VersionInfo {
  version: number
  updatedAt: string
  lastPublishedAt?: string
}
