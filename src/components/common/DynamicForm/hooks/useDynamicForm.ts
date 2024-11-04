import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { DynamicFormConfig } from "../types"
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

  const handleSubmit = async (onSubmit: (values: any) => Promise<void>) => {
    try {
      const values = form.getValues()

      // 提交表单
      await onSubmit(values)
    } catch (error) {
      console.error("Form submission error:", error)
      message.error("提交表单失败")
      throw error
    }
  }

  const setFieldValue = (name: string, value: any) => {
    form.setValue(name, value)
    
    // 触发依赖计算
    const updates = calculateDependentValues(config.dependencies, [name], form.getValues())
    Object.entries(updates).forEach(([field, value]) => {
      form.setValue(field, value)
    })
  }

  const resetForm = (values?: any) => {
    form.reset(values)
  }

  const validateField = async (name: string) => {
    return form.trigger(name)
  }

  return {
    form,
    handleSubmit,
    setFieldValue,
    resetForm,
    validateField,
  }
}