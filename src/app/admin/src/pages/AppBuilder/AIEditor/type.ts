export const AI_LEVELS = {
  EXPERT: {
    label: "高级",
    value: "EXPERT",
    cost: 5,
    color: "warning",
    icon: "mdi:atom",
    description: "高级模型, 能够进行复杂的问题推理和思考, 速度较慢, 费用较贵",
  },
  ADVANCED: {
    label: "初级",
    value: "ADVANCED",
    cost: 0.5,
    color: "primary",
    icon: "mdi:rocket",
    description: "初级模型, 能够进行常规的快速推理和思考, 速度较快,费用较便宜",
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

export interface CodeItem {
  id: string
  title: string
  type: "app" | "page" | "store" | "service" | "module" | "schema"
  code: string
  updatedAt?: string
  name?: string // 用于 store/service/module/schema 的名称
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
  codeItems?: CodeItem[]
  selectedCodeId?: string
  onCodeSelect?: (id: string) => void
}