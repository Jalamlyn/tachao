import { DynamicFormConfig, FormField } from "../types"

// 保留原有函数但标记为废弃
/** @deprecated Use watch function instead */
export const calculateDependentValues = (
  dependencies: DynamicFormConfig["dependencies"],
  changedFields: string[],
  allValues: any
): { [key: string]: any } => {
  const updates: { [key: string]: any } = {}

  if (!dependencies) return updates

  Object.entries(dependencies).forEach(([field, config]) => {
    const shouldUpdate = config.dependsOn.some((dep) => changedFields.includes(dep))
    if (shouldUpdate) {
      try {
        updates[field] = config.calculate(allValues)
      } catch (error) {
        console.error(`Error calculating dependent field ${field}:`, error)
      }
    }
  })

  return updates
}

/** @deprecated Use watch function instead */
export const validateField = (
  field: FormField,
  value: any,
  customValidators?: DynamicFormConfig["customValidators"],
  allValues?: any
): string | undefined => {
  // 运行内置验证器
  if (field.validators) {
    for (const validator of field.validators) {
      const error = validator(value)
      if (error) return error
    }
  }

  // 运行自定义验证器
  if (customValidators && customValidators[field.name]) {
    return customValidators[field.name](value, allValues)
  }

  return undefined
}

/** @deprecated Use watch function instead */
export const evaluateShowWhen = (showWhen: FormField["showWhen"], allValues: any): boolean => {
  if (!showWhen) return true

  const dependentValue = allValues[showWhen.field]

  switch (showWhen.operator) {
    case "neq":
      return dependentValue !== showWhen.value
    case "gt":
      return dependentValue > showWhen.value
    case "lt":
      return dependentValue < showWhen.value
    case "contains":
      return dependentValue?.includes?.(showWhen.value)
    case "eq":
    default:
      return dependentValue === showWhen.value
  }
}

// 新增 watch 相关工具函数
export const createWatchUtils = (form: any) => {
  return {
    // 监听字段变化
    watchField: (fieldName: string, callback: (value: any) => void) => {
      return form.watch(fieldName, callback)
    },

    // 监听多个字段
    watchFields: (fieldNames: string[], callback: (values: any[]) => void) => {
      return form.watch(fieldNames, callback)
    },

    // 批量更新
    batchUpdate: (updates: Array<{ field: string; value: any }>) => {
      form.batch(() => {
        updates.forEach(({ field, value }) => {
          form.setValue(field, value)
        })
      })
    },

    // 条件显示
    setFieldVisibility: (fieldName: string, visible: boolean) => {
      form.setValue(`${fieldName}.hidden`, !visible)
    }
  }
}