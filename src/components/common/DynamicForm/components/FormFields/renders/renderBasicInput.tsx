import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import BasicInput from "../BasicInput"
import { cn } from "@/theme/cn"
import { FormatterService } from "../../../utils/formatters"

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
      {(formField) => {
        // 使用新的格式化系统
        const formattedValue = field.formatConfig
          ? FormatterService.format(formField.value, field.formatConfig)
          : { formattedValue: formField.value, style: undefined }

        return (
          <BasicInput
            type={field.type}
            field={{
              ...formField,
              value: isEditable ? formField.value : formattedValue.formattedValue,
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
            style={formattedValue.style}
            placeholder={field.placeholder}
          />
        )
      }}
    </FormFieldWrapper>
  )
}