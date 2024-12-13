import React from "react"

export const AI_LEVELS = {
  EXPERT: {
    label: "专家",
    value: "expert",
    cost: 3,
    color: "warning",
    icon: "mdi:atom", // 使用SVG图标
    description: "",
    model: "gpt4o",
  },
  ADVANCED: {
    label: "高级",
    value: "advanced",
    cost: 0.3,
    color: "primary",
    icon: "mdi:rocket", // 使用SVG图标
    description: "",
    model: "gpt4o-mini",
  },
} as const

export interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
  code?: {
    preview?: React.ReactNode
    content?: string
  }
  aiLevel?: keyof typeof AI_LEVELS
}

export interface AIEditorProps {
  parseConfig: any
  messages: Message[]
  selectedTab: string
  onTabChange: (key: string) => void
  onCommandResult: (result: any) => void
  onClearMessages?: () => void
  agent: {
    processCommand: (command: string) => Promise<any>
    cacheImage?: (imageData: string) => void
    clearCachedImage?: () => void
  }
  versionControl: {
    versions: any[]
    currentIndex: number
    rollback: () => any | null
    forward: () => any | null
    canRollback: boolean
    canForward: boolean
    getCurrentVersion: () => any | null
    addVersion: (version: any) => void
  }
  renderPreview: (version: any) => React.ReactNode
  renderDataView?: () => React.ReactNode
  showDataTab?: boolean
  showCodeTab?: boolean
  previewTabName?: string
  codeEditorOptions?: {
    language?: string
    readOnly?: boolean
    theme?: string
    customOptions?: any
  }
  imageUpload?: boolean
}