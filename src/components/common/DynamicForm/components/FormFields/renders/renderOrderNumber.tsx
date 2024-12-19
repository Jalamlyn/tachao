import React, { useEffect, useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField } from "../../../types"
import FormFieldWrapper from "../FormFieldWrapper"
import { FormControl, FormItem } from "@/components/ui/form"
import { Input } from "@nextui-org/react"

export const renderOrderNumber = (
  field: FormField,
  form: UseFormReturn<any>,
  isEditable: boolean,
  onChange?: (fieldName: string, value: any) => void
) => {
  // 生成包含随机性的订单编号
  const generateOrderNumber = useCallback(() => {
    const prefix = field.prefix || "ORDER"
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const uniqueId = Math.random().toString(36).substring(2, 8)
    return `${prefix}${timestamp}${random}${uniqueId}`
  }, [field.prefix])

  // 首次渲染时的处理
  useEffect(() => {
    const currentValue = form.getValues(field.name)
    if (!currentValue) {
      const newOrderNumber = generateOrderNumber()
      form.setValue(field.name, newOrderNumber)
      onChange?.(field.name, newOrderNumber)
    }
  }, [form, field.name, generateOrderNumber, onChange])

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
        <FormItem className="w-full">
          <FormControl>
            <Input
              className="min-w-60"
              size="sm"
              {...formField}
              isDisabled={field.disabled !== false}
              variant="underlined"
            />
          </FormControl>
        </FormItem>
      )}
    </FormFieldWrapper>
  )
}