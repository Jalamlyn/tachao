import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult } from "../types"
import { ValidationManager } from "../validation/ValidationManager"

export const useDynamicForm = (config: DynamicFormConfig, formData) => {
  const form = useForm({
    defaultValues: formData,
  })

  // 监听表单值变化
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // 触发表单重新渲染
      form.trigger(name)
    })

    return () => subscription.unsubscribe()
  }, [config.watch])

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
