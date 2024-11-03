import { z } from "zod"
import { DynamicFormConfig, FormField, TableColumn } from "../types"

export const generateFieldSchema = (field: FormField): z.ZodType<any> => {
  let schema: z.ZodType<any>

  switch (field.type) {
    case "number":
      schema = z.number()
      break
    case "file":
      schema = z.object({
        fileId: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
      }).optional()
      break
    default:
      schema = z.string()
  }

  if (field.required) {
    schema = schema.min(1, { message: `${field.label}不能为空` })
  }

  return schema
}

export const generateTableSchema = (columns: TableColumn[]): z.ZodType<any> => {
  const shape: { [key: string]: z.ZodType<any> } = {}

  columns.forEach((column) => {
    let schema: z.ZodType<any>

    switch (column.type) {
      case "number":
        schema = z.number()
        break
      case "file":
        schema = z.object({
          fileId: z.string(),
          fileName: z.string(),
          fileUrl: z.string(),
        }).optional()
        break
      default:
        schema = z.string()
    }

    if (column.required) {
      schema = schema.min(1, { message: `${column.title}不能为空` })
    }

    shape[column.key] = schema
  })

  return z.array(z.object(shape))
}

export const generateDynamicSchema = (config: DynamicFormConfig): z.ZodType<any> => {
  const shape: { [key: string]: z.ZodType<any> } = {}

  // Generate schema for form fields
  Object.entries(config.formFields).forEach(([section, fields]) => {
    const sectionShape: { [key: string]: z.ZodType<any> } = {}
    fields.forEach((field) => {
      sectionShape[field.name] = generateFieldSchema(field)
    })
    shape[section] = z.object(sectionShape)
  })

  // Generate schema for table if exists
  if (config.table) {
    shape.tableData = generateTableSchema(config.table.columns)
  }

  // Generate schema for process steps if exists
  if (config.processSteps) {
    const processShape: { [key: string]: z.ZodType<any> } = {}
    config.processSteps.forEach((step) => {
      const stepShape: { [key: string]: z.ZodType<any> } = {
        confirmed: z.boolean().optional(),
        confirmer: z.string().optional(),
        confirmationDate: z.string().optional(),
        comments: z.string().optional(),
      }

      if (step.fields) {
        step.fields.forEach((field) => {
          stepShape[field.name] = generateFieldSchema(field)
        })
      }

      processShape[step.key] = z.object(stepShape)
    })
    shape.processConfirmations = z.object(processShape)
  }

  return z.object(shape)
}

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

export const evaluateShowWhen = (
  showWhen: FormField["showWhen"],
  allValues: any
): boolean => {
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