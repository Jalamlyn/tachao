import { ReactNode } from "react"
import { UseFormReturn } from "react-hook-form"

// 基础字段类型
export interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  required?: boolean
  validators?: ((value: any) => string | undefined)[]
  options?: { label: string; value: any }[]
}

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  type: string
  width?: string | number
  editable?: boolean
  required?: boolean
  options?: { label: string; value: any }[]
}

// 流程步骤
export interface ProcessStep {
  key: string
  title: string
  description?: string
  icon?: string
  fields?: FormField[]
  onConfirm?: () => Promise<void>
  onCancel?: () => void
  validations?: {
    rules: ((values: any) => string | undefined)[]
  }
}

// 元数据配置
export interface FormMetadata {
  title: string
  description?: string
  permissions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
  status?: 'draft' | 'submitted' | 'approved' | 'rejected'
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// 渲染配置
export interface FormRenderConfig {
  // 基本信息字段
  basicFields: FormField[]
  
  // 表格配置
  table?: {
    columns: TableColumn[]
    summary?: {
      fields: {
        [key: string]: {
          label: string
          calculate: (records: any[]) => number | string
        }
      }
    }
  }
  
  // 流程步骤
  processSteps?: ProcessStep[]
}

// 动态表单配置
export interface DynamicFormConfig {
  metadata: FormMetadata
  renderConfig: FormRenderConfig
}

// 动态表单组件Props
export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
  onSubmit?: (values: any) => Promise<void>
  onCancel?: () => void
}