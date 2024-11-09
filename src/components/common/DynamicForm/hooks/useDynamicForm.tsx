import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult, ValidationContext } from "../types"
import { ValidationManager } from "../validation/ValidationManager"
import { debounce } from "lodash"

// 创建带防抖的 watch
export const createDebouncedWatch = (form: UseFormReturn<any>, delay = 300) => {
  return (fields: string | string[], callback: (values: any) => void) => {
    const debouncedCallback = debounce(callback, delay)
    
    const subscription = form.watch((value, { name }) => {
      if (Array.isArray(fields)) {
        if (fields.includes(name)) {
          debouncedCallback(value)
        }
      } else if (fields === name) {
        debouncedCallback(value)
      }
    })

    return subscription
  }
}

// 格式化验证错误信息
const formatValidationErrors = (errors: Record<string, any>): string[] => {
  return Object.entries(errors).map(([field, error]) => {
    const errorMessage = error.message || error
    return `${field}：${errorMessage}`
  })
}

export const useDynamicForm = (
  config: DynamicFormConfig,
  initialValues?: any,
  onValuesChange?: (changedValues: any, allValues: any) => void
) => {
  const form = useForm({
    defaultValues: initialValues || {},
  })

  // 设置 watch 函数
  useEffect(() => {
    if (!config.watch) {
      console.log('[useDynamicForm] No watch function provided')
      return
    }

    console.log('[useDynamicForm] Setting up watch function')
    let subscription: { unsubscribe: () => void } | null = null

    try {
      subscription = config.watch(form)
      console.log('[useDynamicForm] After setting up watch, subscription:', subscription)

      if (!subscription || typeof subscription.unsubscribe !== 'function') {
        console.warn('[useDynamicForm] Watch function should return a subscription with unsubscribe method')
      }
    } catch (error) {
      console.error('[useDynamicForm] Error in watch setup:', error)
    }

    return () => {
      console.log('[useDynamicForm] Cleaning up watch subscriptions')
      if (subscription?.unsubscribe) {
        try {
          subscription.unsubscribe()
          console.log('[useDynamicForm] Successfully unsubscribed watch')
        } catch (error) {
          console.error('[useDynamicForm] Error unsubscribing watch:', error)
        }
      }
    }
  }, [config.watch, form])

  // 监听表单值变化
  useEffect(() => {
    console.log('[useDynamicForm] Setting up form value change listener')
    const subscription = form.watch((value, { name, type }) => {
      console.log('[useDynamicForm] Form value changed:', { field: name, type, value })
      console.log('[useDynamicForm] Current form values:', form.getValues())
    })

    return () => subscription.unsubscribe()
  }, [form])

  // 统一的验证函数
  const validateForm = useCallback(async (): Promise<ValidationResult> => {
    try {
      // 内置验证
      const isValid = await form.trigger()
      if (!isValid) {
        const formErrors = form.formState.errors
        return {
          valid: false,
          errors: formatValidationErrors(formErrors),
          fields: formErrors
        }
      }

      // 自定义验证
      const values = form.getValues()
      return await ValidationManager.validateForm(values, config)
    } catch (error) {
      console.error("[useDynamicForm] Validation error:", error)
      return {
        valid: false,
        errors: ["表单验证出错"],
        fields: {}
      }
    }
  }, [config, form])

  // 统一的提交处理函数
  const submitForm = useCallback(async (
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
  }, [form, validateForm])

  return {
    form,
    validateForm,
    submitForm,
  }
}