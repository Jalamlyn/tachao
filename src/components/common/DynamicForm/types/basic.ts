import { ReactNode } from "react"

export type FormFieldType =
  | "text"
  | "password"
  | "number"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "date"
  | "datetime"
  | "file"
  | "image"
  | "custom"
  | "resource"
  | "signature"
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"
  | "upload"

export type ManualInputFieldType = "text" | "number" | "email" | "tel" | "textarea" | "select" | "date" | "datetime"

export interface TooltipConfig {
  content: ReactNode
  placement?: "top" | "bottom" | "left" | "right"
}

export interface FormMetadata {
  title: string
  description?: string
  permissions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
}