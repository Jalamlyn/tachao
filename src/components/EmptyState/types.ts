import { ReactNode } from "react"

export interface EmptyStateProps {
  type?: "no-data" | "no-permission" | "error"
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    text: string
    onClick: () => void
  }
  className?: string
}