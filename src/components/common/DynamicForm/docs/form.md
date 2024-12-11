# 表单配置类型定义

## FormRenderConfig
表单渲染配置接口:
```typescript
interface FormRenderConfig {
  basicFields:
    | FormField[]
    | {
        groups: FormFieldGroup[]
        defaultGroup?: string
      }
  table?: TableConfig
  tables?: TableGroup[]
  processSteps?: ProcessStep[]
}
```

## DynamicFormConfig
动态表单配置接口:
```typescript
interface DynamicFormConfig {
  metadata: FormMetadata
  renderConfig: FormRenderConfig
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
  watch?: (form: UseFormReturn<any>) => () => void
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
  validationRules?: Record<string, ValidationRule>
  eventHandlers?: FormEventHandlers
}
```

## DynamicFormProps
动态表单属性接口:
```typescript
interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  onCancel?: () => void
  templateId?: string
  isCreateMode?: boolean
  previewMode?: boolean
}
```