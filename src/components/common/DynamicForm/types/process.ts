import { FormField } from "./field"

export interface ProcessStepDependency {
  step: string
  condition?: {
    field?: string
    value?: any
    custom?: (stepData: any) => boolean
  }
  message?: string
}

export interface ProcessStepTimeout {
  duration: number
  action: "warn" | "block" | "auto-approve" | "auto-reject"
  message?: string
  callback?: (step: string) => void
}

export interface ProcessStepApprovers {
  type: "single" | "multiple" | "any" | "all"
  roles?: string[]
  users?: string[]
  minApprovers?: number
  maxApprovers?: number
  deadline?: number
  notifyType?: "email" | "sms" | "both"
  escalation?: {
    after: number
    to: string[]
  }
}

export interface ProcessStep {
  key: string
  title: string
  description?: string
  icon?: string
  fields?: FormField[]
  dependencies?: ProcessStepDependency[]
  weight?: number
  timeout?: ProcessStepTimeout
  approvers?: ProcessStepApprovers
  className?: string
  style?: React.CSSProperties
}

export interface ProcessStepStatus {
  isCompleted: boolean
  isBlocked: boolean
  blockReason?: string
}

export interface ProcessProgress {
  total: number
  completed: number
  current: number
  percentage: number
  status: {
    [key: string]: ProcessStepStatus
  }
}