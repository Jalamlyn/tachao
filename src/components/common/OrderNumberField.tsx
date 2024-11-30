import React, { useEffect, useCallback } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@nextui-org/react"

interface OrderNumberFieldProps {
  form: UseFormReturn<any>
  prefix?: string
  fieldName: string
  label?: string
  disabled?: boolean
}

const OrderNumberField: React.FC<OrderNumberFieldProps> = ({
  form,
  prefix = "ORDER",
  fieldName,
  label = "订单编号",
  disabled = true,
}) => {
  // 生成包含随机性的订单编号
  const generateOrderNumber = useCallback(() => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
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

  useEffect(() => {
    // 监听表单提交状态
    const subscription = form.watch(() => {
      const formState = form.getValues()
      // 如果表单被重置（所有字段为空）或订单号为空，重新生成
      if (!formState[fieldName]) {
        resetOrderNumber()
      }
    })

    // 初始化时如果字段为空，生成新的订单编号
    if (!form.getValues(fieldName)) {
      resetOrderNumber()
    }

    return () => subscription.unsubscribe()
  }, [form, fieldName, resetOrderNumber])

  // 监听表单提交状态
  useEffect(() => {
    const formState = form.formState
    if (formState.isSubmitSuccessful) {
      // 提交成功后延迟重置，确保数据已保存
      setTimeout(() => {
        resetOrderNumber()
      }, 100)
    }
  }, [form.formState.isSubmitSuccessful, resetOrderNumber])

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input {...field} disabled={disabled} variant='flat' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default OrderNumberField