import { UseFormReturn } from "react-hook-form"

export interface ResourceFieldGroupProps {
  resourceTitle: string
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  onDataSelect?: (fullData: any) => void
  form?: UseFormReturn<any>
}

export interface ResourceSelectModalProps {
  open: boolean
  onClose: () => void
  onSelect: (data: any) => void
  resourceTitle: string
  fields: FieldConfig[]
}

export interface FieldConfig {
  key: string
  label: string
  value?: any
}