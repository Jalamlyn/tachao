import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig, ValidationResult, ValidationContext } from "../types"
import { calculateDependentValues } from "../utils/fieldUtils"
import message from "@/components/Message"

export const useDynamicForm = (
  config: DynamicFormConfig,
  initialValues?: any,
  onValuesChange?: (changedValues: any, allValues: any) => void
) => {
  const form = useForm({
    defaultValues: initialValues,
  })

  // 处理字段依赖关系
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change" && name) {
        // 计算依赖值
        const updates = calculateDependentValues(config.dependencies, [name], value)

        // 更新依赖字段
        Object.entries(updates).forEach(([field, value]) => {
          form.setValue(field, value)
        })

        // 触发值变化回调
        if (onValuesChange) {
          onValuesChange({ [name]: value }, form.getValues())
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [config.dependencies, form, onValuesChange])

  // 处理表格数据变化
  useEffect(() => {
    if (!config.table) return

    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("tableData.")) {
        const [, rowIndex, field] = name.split(".")
        const row = form.getValues(`tableData.${rowIndex}`)

        // 处理行级计算
        if (config.table.rowCalculations) {
          Object.entries(config.table.rowCalculations).forEach(([calcField, calculate]) => {
            try {
              const calcValue = calculate(row)
              form.setValue(`tableData.${rowIndex}.${calcField}`, calcValue)
            } catch (error) {
              console.error(`Error calculating field ${calcField}:`, error)
            }
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [config.table, form])

  // 表单级别校验函数
  const validateForm = useCallback(async (context?: ValidationContext): Promise<ValidationResult> => {
    try {
      // 首先执行 react-hook-form 的内置校验
      const isValid = await form.trigger()
      if (!isValid) {
        const errors = Object.entries(form.formState.errors).map(([field, error]) => {
          return `${error.message || `${field}字段有误`}`
        })
        
        return {
          valid: false,
          errors,
          fields: Object.entries(form.formState.errors).reduce((acc, [field, error]) => {
            acc[field] = error.message as string
            return acc
          }, {} as { [key: string]: string })
        }
      }

      // 如果配置了自定义校验函数，则执行
      if (config.validate) {
        const values = form.getValues()
        const result = await Promise.resolve(config.validate(values, context))
        
        // 如果有字段级错误，设置到表单状态
        if (result.fields) {
          Object.entries(result.fields).forEach(([field, error]) => {
            form.setError(field, { type: 'custom', message: error })
          })
        }
        
        return result
      }

      return { valid: true }
    } catch (error) {
      console.error("Form validation error:", error)
      return {
        valid: false,
        errors: ["表单校验出错，请重试"],
        fields: {}
      }
    }
  }, [config.validate, form])

  const handleSubmit = useCallback(async (onSubmit: (values: any) => Promise<void>) => {
    try {
      // 执行表单校验
      const validationResult = await validateForm({ mode: 'submit' })
      
      if (!validationResult.valid) {
        // 如果校验失败，显示错误信息
        if (validationResult.errors && validationResult.errors.length > 0) {
          message.error(validationResult.errors.join("\n"))
        }
        return
      }

      // 如果有警告信息，显示确认对话框
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        const confirmed = window.confirm(
          `警告:\n${validationResult.warnings.join("\n")}\n\n是否继续提交？`
        )
        if (!confirmed) {
          return
        }
      }

      const values = form.getValues()

      // 提交表单
      await onSubmit(values)
    } catch (error) {
      console.error("Form submission error:", error)
      message.error("提交表单失败")
      throw error
    }
  }, [form, validateForm])

  const setFieldValue = useCallback((name: string, value: any) => {
    form.setValue(name, value)
    
    // 触发依赖计算
    const updates = calculateDependentValues(config.dependencies, [name], form.getValues())
    Object.entries(updates).forEach(([field, value]) => {
      form.setValue(field, value)
    })
  }, [config.dependencies, form])

  const resetForm = useCallback((values?: any) => {
    form.reset(values)
  }, [form])

  const validateField = useCallback(async (name: string) => {
    return form.trigger(name)
  }, [form])

  return {
    form,
    handleSubmit,
    setFieldValue,
    resetForm,
    validateField,
    validateForm,
  }
}