import React, { useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"

interface OrderNumberFieldProps {
  form: UseFormReturn<any>
  prefix?: string
  fieldName: string
  label?: string
  disabled?: boolean
}

const OrderNumberField: React.FC<OrderNumberFieldProps> = ({
  form,
  prefix = 'ORDER',
  fieldName,
  label = "订单编号",
  disabled = true
}) => {
  const generateOrderNumber = () => {
    return `${prefix}${Date.now()}`
  }

  useEffect(() => {
    // 只在字段为空时生成新的订单编号
    const currentValue = form.getValues(fieldName)
    if (!currentValue) {
      const orderNumber = generateOrderNumber()
      form.setValue(fieldName, orderNumber)
      
      // 如果存在 title 字段，也设置 title
      if (form.getValues('title') === undefined || form.getValues('title') === '') {
        form.setValue('title', orderNumber)
      }
    }
  }, [form, fieldName, prefix])

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} disabled />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default OrderNumberField