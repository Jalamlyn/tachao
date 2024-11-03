import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { DynamicFormConfig } from "../types"

export const useFormValidation = (form: UseFormReturn<any>, config: DynamicFormConfig) => {
  const [hasErrors, setHasErrors] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    const subscription = form.watch(() => {
      validateForm()
    })
    return () => subscription.unsubscribe()
  }, [form, config])

  const validateField = (fieldName: string, value: any) => {
    const errors: string[] = []

    // 1. 检查必填
    const field = Object.values(config.formFields)
      .flat()
      .find((f) => f.name === fieldName)
    
    if (field?.required && !value) {
      errors.push(`${field.label}不能为空`)
    }

    // 2. 检查字段验证器
    if (field?.validators) {
      field.validators.forEach((validator) => {
        const error = validator(value)
        if (error) {
          errors.push(error)
        }
      })
    }

    // 3. 检查自定义验证器
    if (config.customValidators?.[fieldName]) {
      const error = config.customValidators[fieldName](value, form.getValues())
      if (error) {
        errors.push(error)
      }
    }

    return errors
  }

  const validateForm = () => {
    const errors: string[] = []
    const values = form.getValues()

    // 1. 验证所有字段
    Object.entries(values).forEach(([fieldName, value]) => {
      const fieldErrors = validateField(fieldName, value)
      errors.push(...fieldErrors)
    })

    // 2. 验证表格数据
    if (config.table) {
      const tableData = values.tableData || []
      tableData.forEach((row: any, index: number) => {
        config.table!.columns.forEach((column) => {
          if (column.required && !row[column.key]) {
            errors.push(`第${index + 1}行的${column.title}不能为空`)
          }
        })
      })
    }

    // 3. 验证流程步骤
    if (config.processSteps) {
      config.processSteps.forEach((step) => {
        if (step.validations) {
          step.validations.rules.forEach((rule) => {
            const error = rule(values)
            if (error) {
              errors.push(error)
            }
          })
        }
      })
    }

    setHasErrors(errors.length > 0)
    setValidationErrors(errors)
    return errors
  }

  const validateFieldValue = (fieldName: string, value: any) => {
    const errors = validateField(fieldName, value)
    return errors.length > 0 ? errors[0] : undefined
  }

  const validateStep = (stepKey: string) => {
    const step = config.processSteps?.find((s) => s.key === stepKey)
    if (!step?.validations) return []

    const errors: string[] = []
    const values = form.getValues()

    step.validations.rules.forEach((rule) => {
      const error = rule(values)
      if (error) {
        errors.push(error)
      }
    })

    return errors
  }

  return {
    hasErrors,
    validationErrors,
    validateForm,
    validateFieldValue,
    validateStep,
  }
}