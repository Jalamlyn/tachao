import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult } from "../types"
import { ValidationManager } from "../validation/ValidationManager"

export const useDynamicForm = (config: DynamicFormConfig, formData) => {
  const form = useForm({
    defaultValues: formData,
  })

  // 统一的验证函数
  const validateForm = useCallback(async (): Promise<ValidationResult> => {
    try {
      const values = form.getValues()
      
      // 先触发 react-hook-form 的内置验证
      const triggerResult = await form.trigger()
      const formErrors = form.formState.errors

      // 如果内置验证失败，收集错误信息
      if (!triggerResult) {
        const fields: Record<string, string> = {}
        Object.entries(formErrors).forEach(([field, error]) => {
          fields[field] = error.message || String(error)
        })

        return {
          valid: false,
          errors: ["表单验证失败"],
          fields,
        }
      }

      // 进行自定义验证
      const customValidationResult = await ValidationManager.validateForm(values, config)

      // 如果自定义验证失败，合并错误信息
      if (!customValidationResult.valid) {
        return {
          valid: false,
          errors: [...(customValidationResult.errors || [])],
          fields: {
            ...(customValidationResult.fields || {}),
          },
        }
      }

      return {
        valid: true,
        errors: [],
        fields: {},
      }
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