import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Slider } from "@nextui-org/react"

export const renderSlider = (
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
        <div className='w-full px-2'>
          <Slider
            value={formField.value}
            onChange={(value) => {
              formField.onChange(value)
              onChange?.(field.name, value)
            }}
            min={field.min}
            max={field.max}
            step={field.step}
            isDisabled={!isEditable || field.disabled}
            className='max-w-md'
          />
        </div>
      )}
    </FormFieldWrapper>
  )
}