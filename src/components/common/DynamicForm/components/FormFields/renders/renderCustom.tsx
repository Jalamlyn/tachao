import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"

export const renderCustom = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  return (
    <FormFieldWrapper
      name={field.name}
      label={field.label}
      form={form}
      isEditable={isEditable}
      disabled={field.disabled}
      tooltip={field.tooltip}
      required={field.required}
    >
      {(formField) =>
        field?.render?.({
          field: {
            ...formField,
            onChange: (value: any) => {
              formField.onChange(value)
              onChange?.(field.name, value)
            },
          },
          form,
          isEditable,
        })
      }
    </FormFieldWrapper>
  )
}
