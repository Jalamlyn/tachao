import { MetadataDetail } from "@/hooks/metadata/types"

export interface FormType {
  type: string
  label: string
  forms: MetadataDetail[]
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  id: string
}

export interface ChatHistory {
  formType: string
  messages: ChatMessage[]
}