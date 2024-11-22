import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField as DynamicFormField } from "../types"
import DynamicFormFields from "./FormFields"

interface DynamicFormFieldsProps {
  fields: DynamicFormField[]
  form: UseFormReturn<any>
  isEditable?: boolean
  onChange?: (fieldName: string, value: any) => void
}

const DynamicFormFieldsWrapper: React.FC<DynamicFormFieldsProps> = (props) => {
  return <DynamicFormFields {...props} />
}

export default DynamicFormFieldsWrapper