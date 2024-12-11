# 流程相关类型定义

## ProcessStepDependency
流程步骤依赖接口:
```typescript
interface ProcessStepDependency {
  step: string
  condition?: {
    field?: string
    value?: any
    custom?: (stepData: any) => boolean
  }
  message?: string
}
```

## ProcessStepTimeout
流程步骤超时配置接口:
```typescript
interface ProcessStepTimeout {
  duration: number
  action: "warn" | "block" | "auto-approve" | "auto-reject"
  message?: string
  callback?: (step: string) => void
}
```

## ProcessStepApprovers
流程步骤审批人配置接口:
```typescript
interface ProcessStepApprovers {
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
```

## ProcessStep
流程步骤接口:
```typescript
interface ProcessStep {
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
```

## ProcessStepStatus
流程步骤状态接口:
```typescript
interface ProcessStepStatus {
  isCompleted: boolean
  isBlocked: boolean
  blockReason?: string
}
```

## ProcessProgress
流程进度接口:
```typescript
interface ProcessProgress {
  total: number
  completed: number
  current: number
  percentage: number
  status: {
    [key: string]: ProcessStepStatus
  }
}
```