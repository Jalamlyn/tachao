import { UseFormReturn } from "react-hook-form"
import { FormField, FormFieldGroup } from "./field"
import { TableConfig, TableGroup } from "./table"
import { ProcessStep } from "./process"
import { FormMetadata } from "./basic"
import { ValidationContext, ValidationResult, ValidationRule, FormEventHandlers } from "./validation"

export interface FormRenderConfig {
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

export interface DynamicFormConfig {
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

export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  onCancel?: () => void
  templateId?: string
  isCreateMode?: boolean
  previewMode?: boolean
}
