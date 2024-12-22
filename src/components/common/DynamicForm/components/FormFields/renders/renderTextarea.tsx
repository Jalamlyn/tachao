import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/theme/cn"

export const renderTextarea = (
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
        <Textarea
          {...formField}
          onChange={(e) => {
            formField.onChange(e)
            onChange?.(field.name, e.target.value)
          }}
          placeholder={field.placeholder}
          className={cn(
            "min-h-[100px] md:min-h-[80px]",
            "w-full rounded-md border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            "resize-none transition-colors",
            "placeholder:text-gray-400",
            field.className
          )}
        />
      )}
    </FormFieldWrapper>
  )
}
