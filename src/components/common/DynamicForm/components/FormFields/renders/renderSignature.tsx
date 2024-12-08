import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import SignaturePad from "@/components/common/SignaturePad"

export const renderSignature = (
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
      {(formField) => (
        <SignaturePad
          width={field.width}
          height={field.height}
          lineWidth={field.lineWidth}
          lineColor={field.lineColor}
          disabled={!isEditable || field.disabled}
          className={field.className}
          value={formField.value}
          onChange={(value) => {
            formField.onChange(value)
            onChange?.(field.name, value)
          }}
        />
      )}
    </FormFieldWrapper>
  )
}