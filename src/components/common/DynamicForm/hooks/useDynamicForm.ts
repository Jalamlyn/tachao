import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DynamicFormConfig } from "../types"
import { useDynamicSchema } from "./useDynamicSchema"
import { calculateDependentValues } from "../utils/fieldUtils"

export const useDynamicForm = (
  config: DynamicFormConfig,
  initialValues?: any,
  onValuesChange?: (changedValues: any, allValues: any) => void
) => {
  const schema = useDynamicSchema(config)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change" && name) {
        const updates = calculateDependentValues(config.dependencies, [name], value)

        Object.entries(updates).forEach(([field, value]) => {
          form.setValue(field, value)
        })

        if (onValuesChange) {
          onValuesChange({ [name]: value }, form.getValues())
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [config.dependencies, form, onValuesChange])

  const handleSubmit = async (onSubmit: (values: any) => Promise<void>) => {
    try {
      const values = form.getValues()
      await onSubmit(values)
    } catch (error) {
      console.error("Form submission error:", error)
      throw error
    }
  }

  return {
    form,
    handleSubmit,
  }
}
