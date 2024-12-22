import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult } from "../types"
import { ValidationManager } from "../validation/ValidationManager"

export const useDynamicForm = (config: DynamicFormConfig, formData) => {
  const form = useForm({
    defaultValues: formData,
  })

  useEffect(() => {
    let triggerCount = 0 // 用于计数的变量

    const subscription = form.watch((value, { name, type }) => {
      if (triggerCount >= 10) {
        console.error(`触发次数超过限制（${triggerCount} 次），可能存在死循环！`)
        throw new Error(`表单触发次数超过限制（${triggerCount} 次）`)
      }

      triggerCount++ // 每次触发计数加 1
      console.log(`当前触发次数：${triggerCount}`)

      // 执行触发操作
      form.trigger(name)
    })

    return () => {
      subscription.unsubscribe()
      triggerCount = 0 // 清空计数
    }
  }, [])

  // 统一的验证函数
  const validateForm = useCallback(async (): Promise<ValidationResult> => {
    try {
      const values = form.getValues()
      // 直接使用ValidationManager进行统一校验
      return await ValidationManager.validateForm(values, config)
    } catch (error) {
      console.error("[useDynamicForm] Validation error:", error)
      return {
        valid: false,
        errors: ["表单校验出错"],
        fields: {},
      }
    }
  }, [config, form])

  // 统一的提交处理函数
  const submitForm = useCallback(
    async (
      values: any,
      options?: {
        onSuccess?: () => void
        onError?: (error: Error) => void
      }
    ) => {
      try {
        // 验证
        const validationResult = await validateForm()
        if (!validationResult.valid) {
          // 设置字段错误
          if (validationResult.fields) {
            Object.entries(validationResult.fields).forEach(([field, error]) => {
              form.setError(field, { type: "custom", message: error })
            })
          }
          return { success: false, validationResult }
        }

        return { success: true, validationResult, values }
      } catch (error) {
        console.error("[useDynamicForm] Submit error:", error)
        options?.onError?.(error as Error)
        return { success: false, error }
      }
    },
    [form, validateForm]
  )

  return {
    form,
    validateForm,
    submitForm,
  }
}
