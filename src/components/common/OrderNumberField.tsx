import React, { useEffect, useCallback, useState } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@nextui-org/react"
import { useLocation } from "react-router-dom"

interface OrderNumberFieldProps {
  form: UseFormReturn<any>
  prefix?: string
  fieldName: string
  label?: string
  disabled?: boolean
  isUpdating?: number
}

const OrderNumberField: React.FC<OrderNumberFieldProps> = ({
  form,
  prefix = "ORDER",
  fieldName,
  label = "订单编号",
  disabled = true,
  isUpdating = 0,
}) => {
  const [isCreateMode, setIsCreateMode] = useState(false)
  const location = useLocation()

  // 生成包含随机性的订单编号
  const generateOrderNumber = useCallback(() => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const uniqueId = Math.random().toString(36).substring(2, 8)
    return `${prefix}${timestamp}${random}${uniqueId}`
  }, [prefix])

  // 重置订单编号
  const resetOrderNumber = useCallback(() => {
    const newOrderNumber = generateOrderNumber()
    form.setValue(fieldName, newOrderNumber)

    // 如果存在 title 字段，也更新 title
    if (form.getValues("title") === undefined || form.getValues("title") === "") {
      form.setValue("title", newOrderNumber)
    }
  }, [form, fieldName, generateOrderNumber])

  // 首次渲染时的处理
  useEffect(() => {
    if (location.pathname.includes("form-create")) {
      const currentNumber = form.getValues(fieldName)
      if (!currentNumber) {
        resetOrderNumber()
      }
      setIsCreateMode(true)
    }
  }, [])

  // 只在创建模式下响应isUpdating
  useEffect(() => {
    if (isCreateMode) {
      resetOrderNumber()
    }
  }, [isUpdating])

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input className='min-w-60' size='sm' {...field} isDisabled variant='underlined' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default OrderNumberField
