import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult } from "../types"
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
      console.log("[useDynamicForm] No watch function provided")
      return
    }

    console.log("[useDynamicForm] Setting up watch function")
    let unsubscribe: (() => void) | undefined

    try {
      unsubscribe = config.watch(form)
      console.log("[useDynamicForm] After setting up watch, unsubscribe:", unsubscribe)

      if (typeof unsubscribe !== "function") {
        console.warn("[useDynamicForm] Watch function should return an unsubscribe function")
      }
    } catch (error) {
      console.error("[useDynamicForm] Error in watch setup:", error)
    }

    return () => {
      console.log("[useDynamicForm] Cleaning up watch subscriptions")
      if (typeof unsubscribe === "function") {
        try {
          unsubscribe()
          console.log("[useDynamicForm] Successfully unsubscribed watch")
        } catch (error) {
          console.error("[useDynamicForm] Error unsubscribing watch:", error)
        }
      }
    }
  }, [])

  // 监听表单值变化
  useEffect(() => {
    console.log("[useDynamicForm] Setting up form value change listener")
    const subscription = form.watch((value, { name, type }) => {
      console.log("[useDynamicForm] Form value changed:", { field: name, type, value })
      console.log("[useDynamicForm] Current form values:", form.getValues())

      // 触发表单重新渲染
      form.trigger(name)
    })

    return () => subscription.unsubscribe()
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
