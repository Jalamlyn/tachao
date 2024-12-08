import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Switch } from "@nextui-org/react"

export const renderSwitch = (
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
        <div className='flex items-center gap-2'>
          <Switch
            isSelected={formField.value}
            onValueChange={(checked) => {
              formField.onChange(checked)
              onChange?.(field.name, checked)
            }}
            isDisabled={!isEditable || field.disabled}
          />
          {formField.value ? field.checkedLabel : field.uncheckedLabel}
        </div>
      )}
    </FormFieldWrapper>
  )
}