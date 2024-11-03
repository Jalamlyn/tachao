import { ReactNode } from "react"
import { z } from "zod"

export type FieldType =
  // 基础输入
  | "text"
  | "number"
  | "textarea"
  | "password"
  | "email"
  | "tel"
  | "url"
  // 选择类型
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "time"
  | "datetime"
  // 上传类型
  | "file"
  | "image"
  // 特殊类型
  | "resource"
  | "cascader"
  | "switch"
  | "slider"
  | "rate"
  // 自定义
  | "custom"

export interface BaseField {
  name: string
  label: string
  type: FieldType
  required: boolean
  defaultValue: any
  placeholder: string
  disabled: boolean
  hidden: boolean
  customComponent: ReactNode
  validators: Array<(value: any) => string | undefined>
  // 条件显示
  showWhen: {
    field: string
    value: any
    operator: "eq" | "neq" | "gt" | "lt" | "contains"
  }
}

export interface SelectField extends BaseField {
  type: "select" | "radio" | "checkbox"
  options: Array<{
    label: string
    value: any
    disabled: boolean
  }>
  multiple: boolean
}

export interface DateField extends BaseField {
  type: "date" | "time" | "datetime"
  format: string
  showTime: boolean
  disabledDate: (date: Date) => boolean
}

export interface ResourceField extends BaseField {
  type: "resource"
  resourceName: string
  appId: string
  selectionMode: "single" | "multiple"
  onSelect: (selected: any[]) => void
}

export interface FileField extends BaseField {
  type: "file" | "image"
  accept: string
  maxSize: number
  onUpload: (file: File) => Promise<void>
}

export interface CustomField extends BaseField {
  type: "custom"
  render: (props: any) => ReactNode
}

export type FormField = BaseField | SelectField | DateField | ResourceField | FileField | CustomField

export interface TableColumn {
  key: string
  title: string
  type: FieldType
  width: number | string
  required: boolean
  editable: boolean
  render: (value: any, record: any, index: number) => ReactNode
  resourceConfig: {
    resourceName: string
    appId: string
    selectionMode: "single" | "multiple"
  }
  fileConfig: {
    accept: string
    maxSize: number
  }
  dateConfig: {
    minDate: Date
    maxDate: Date
    format: string
    showTime: boolean
  }
}

export interface TableSummary {
  fields: {
    [key: string]: {
      label: string
      calculate: (records: any[]) => number | string
    }
  }
}

export interface TableConfig {
  columns: TableColumn[]
  summary: TableSummary
  rowCalculations: {
    [key: string]: (record: any) => number | string
  }
  toolbar: ReactNode
  operations: {
    render: (record: any, index: number) => ReactNode
  }
}

export interface ProcessStep {
  key: string
  title: string
  description: string
  icon: string
  fields: FormField[]
  // 确认前的校验规则
  validations: {
    rules: Array<(values: any) => string | undefined>
    messages: string[]
  }
  // 确认后的行为
  onConfirm: {
    // 更新其他字段
    updates: Array<{
      field: string
      value: any | ((values: any) => any)
    }>
    // 触发计算
    calculations: Array<{
      field: string
      formula: (values: any) => any
    }>
  }
  // 确认信息配置
  confirmation: {
    requireComments: boolean
    commentLabel: string
    confirmButtonText: string
    cancelButtonText: string
  }
}

export interface PrintConfig {
  documentTitle: string
  pageStyle: string
  // 打印模板配置
  template: {
    header: {
      title: string
      subtitle: string
      logo: string
    }
    content: {
      fields: string[] // 要打印的字段
      layout: "table" | "form"
      columns: number
    }
    footer: {
      showPageNumber: boolean
      showDate: boolean
      customText: string
    }
  }
  // 打印前的数据转换
  transform: (values: any) => any
}

export interface DynamicFormConfig {
  formFields: {
    [section: string]: FormField[]
  }
  table: TableConfig
  processSteps: ProcessStep[]
  print: PrintConfig
  dependencies: {
    [fieldName: string]: {
      dependsOn: string[]
      calculate: (values: any) => any
    }
  }
  customValidators: {
    [fieldName: string]: (value: any, allValues: any) => string | undefined
  }
  form: {
    layout: "horizontal" | "vertical"
    labelWidth: string | number
    submitButton: {
      text: string
      position: "left" | "center" | "right"
    }
  }
}

export interface DynamicFormProps {
  config: DynamicFormConfig
  id?: string
}