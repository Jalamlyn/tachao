import { UseFormReturn } from "react-hook-form"
import { ReactNode } from "react"

// 表单字段基础类型
export interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  disabled?: boolean
  hidden?: boolean
  editable?: boolean
  validators?: ((value: any) => string | undefined)[]
  accept?: string
  onUpload?: (file: File) => Promise<void>
  render?: (props: { field: any; form: UseFormReturn<any>; isEditable: boolean }) => ReactNode
  options?: { label: string; value: any; disabled?: boolean }[]
  showWhen?: {
    field: string
    value: any
    operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'contains'
  }
}

// 表格配置类型
export interface TableConfig {
  columns: {
    key: string
    title: string
    type: string
    width?: string | number
    editable?: boolean
    placeholder?: string
    resourceConfig?: {
      resourceName: string
      appId: string
      selectionMode: 'single' | 'multiple'
    }
    options?: { label: string; value: any; disabled?: boolean }[]
    render?: (value: any, record: any, index: number) => ReactNode
  }[]
  rowCalculations?: {
    [field: string]: (row: any) => any
  }
  dependencies?: {
    [field: string]: {
      dependsOn: string[]
      calculate: (values: any) => any
    }
  }
  summary?: {
    fields: {
      [key: string]: {
        label: string
        calculate: (records: any[]) => number | string
      }
    }
  }
  toolbar?: ReactNode
}

// 流程步骤配置类型
export interface ProcessStep {
  key: string
  title: string
  description?: string
  icon?: string
  fields?: FormField[]
  onConfirm?: {
    action: (values: any) => Promise<void>
    updates?: { field: string; value: string | ((values: any) => any) }[]
    calculations?: { field: string; formula: (values: any) => any }[]
  }
  onCancel?: () => void
  validations?: {
    rules: ((values: any) => string | undefined)[]
  }
  confirmation?: {
    confirmButtonText?: string
    cancelButtonText?: string
    requireComments?: boolean
    commentLabel?: string
  }
}

// 动态表单配置类型
export interface DynamicFormConfig {
  // 表单基础配置
  form?: {
    layout?: 'vertical' | 'horizontal'
    labelWidth?: string
    submitButton?: {
      text?: string
      position?: 'left' | 'center' | 'right'
    }
  }
  // 工具栏配置
  toolbar?: {
    print?: {
      enabled?: boolean
      text?: string
      icon?: string
    }
    save?: {
      enabled?: boolean
      text?: string
      icon?: string
    }
    edit?: {
      enabled?: boolean
      text?: string
      icon?: string
    }
  }
  // 打印配置
  print?: {
    documentTitle?: string
    pageStyle?: string
    template?: {
      header?: {
        title?: string
        subtitle?: string
        logo?: string
      }
      content?: {
        fields?: string[]
        layout?: 'form' | 'table'
        columns?: number
      }
      footer?: {
        showPageNumber?: boolean
        showDate?: boolean
        customText?: string
      }
    }
  }
  // 订单号字段配置
  orderNumberField?: {
    enabled?: boolean
    prefix?: string
    fieldName?: string
    label?: string
  }
  // 表单字段配置
  formFields?: {
    [section: string]: FormField[]
  }
  // 表格配置
  table?: TableConfig
  // 流程步骤配置
  processSteps?: ProcessStep[]
  // 依赖关系配置
  dependencies?: {
    [field: string]: {
      dependsOn: string[]
      calculate: (values: any) => any
    }
  }
  // 自定义验证器
  customValidators?: {
    [field: string]: (value: any, allValues: any) => string | undefined
  }
}

// 动态表单组件Props类型
export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
}