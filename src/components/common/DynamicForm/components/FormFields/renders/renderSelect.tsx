import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/theme/cn"
import { motion } from "framer-motion"

export const renderSelect = (
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
        <Select
          disabled={!isEditable || field.disabled}
          onValueChange={(value) => {
            formField.onChange(value)
            onChange?.(field.name, value)
            form.trigger(field.name)
          }}
          value={formField.value}
          defaultValue={formField.value}
        >
          <SelectTrigger
            className={cn(
              "w-full",
              "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              "transition-colors",
              "placeholder:text-gray-400",
              field.className
            )}
          >
            <SelectValue placeholder={field.placeholder || "请选择"} />
          </SelectTrigger>
          <SelectContent>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {(typeof field.options === "function" ? field.options(form) : field.options || []).map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "cursor-pointer transition-colors",
                    "hover:bg-blue-50 hover:text-blue-600",
                    "focus:bg-blue-50 focus:text-blue-600",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {option.label}
                </SelectItem>
              ))}
            </motion.div>
          </SelectContent>
        </Select>
      )}
    </FormFieldWrapper>
  )
}