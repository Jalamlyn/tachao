export interface AppPages {
  [pageId: string]: {
    code: string
    title: string
    updatedAt: string
  }
}

export interface AppCache {
  [appId: string]: {
    pages: AppPages
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
  timestamp: string
}