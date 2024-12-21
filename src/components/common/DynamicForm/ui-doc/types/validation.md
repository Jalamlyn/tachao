```typescript
export interface ValidationContext {
  mode?: "create" | "edit"
  user?: any
}

export interface ValidationResult {
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

export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  validate?: (value: any) => string | undefined
  message?: string
}

export interface FormState {
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  errors: Record<string, string>
}

export interface FormEventHandlers {
  onChange?: (values: any) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}
```
