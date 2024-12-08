import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { RadioGroup, Radio } from "@nextui-org/react"

export const renderRadio = (
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
        <RadioGroup
          orientation={field.layout || "horizontal"}
          value={formField.value}
          onValueChange={(value) => {
            formField.onChange(value)
            onChange?.(field.name, value)
          }}
          isDisabled={!isEditable || field.disabled}
        >
          {(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
            <Radio key={option.value} value={option.value} isDisabled={option.disabled}>
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      )}
    </FormFieldWrapper>
  )
}