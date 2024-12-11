# 验证相关类型定义

## ValidationContext
验证上下文接口:
```typescript
interface ValidationContext {
  mode?: "create" | "edit"
  user?: any
}
```

## ValidationResult
验证结果接口:
```typescript
interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
  fields?: {
    [key: string]: string
  }
  categorizedErrors?: {
    required?: Array<{ field: string; message: string }>
    invalid?: Array<{ field: string; message: string }>
    other?: Array<{ field: string; message: string }>
  }
}
```

## ValidationRule
验证规则接口:
```typescript
interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  validate?: (value: any) => string | undefined
  message?: string
}
```

## FormState
表单状态接口:
```typescript
interface FormState {
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  errors: Record<string, string>
}
```

## FormEventHandlers
表单事件处理器接口:
```typescript
interface FormEventHandlers {
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  onChange?: (values: any) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}
```