import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import BasicInput from "../BasicInput"
import { cn } from "@/theme/cn"

export const renderBasicInput = (
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
        <BasicInput
          type={field.type}
          field={{
            ...formField,
            onChange: (e: any) => {
              formField.onChange(e)
              onChange?.(field.name, e.target.value)
            },
          }}
          className={cn(
            field.type === "number" ? "text-right font-mono" : "",
            "w-full rounded-md",
            "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            "transition-colors duration-200",
            "placeholder:text-gray-400",
            field.className
          )}
          placeholder={field.placeholder}
        />
      )}
    </FormFieldWrapper>
  )
}