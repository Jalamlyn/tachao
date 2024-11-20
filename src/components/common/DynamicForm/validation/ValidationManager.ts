import { DynamicFormConfig, FormField, TableColumn, ValidationResult } from "../types"

export class ValidationManager {
  // 统一处理表单级别校验
  static async validateForm(values: any, config: DynamicFormConfig): Promise<ValidationResult> {
    try {
      console.log('[ValidationManager] validateForm start:', { values, config })
      
      // 1. 执行字段级别校验
      const fieldErrors = await this.validateFields(values, config)
      console.log('[ValidationManager] field validation results:', fieldErrors)
      
      if (Object.keys(fieldErrors).length > 0) {
        // 对错误进行分类
        const categorizedErrors = this.categorizeErrors(fieldErrors)
        console.log('[ValidationManager] categorized errors:', categorizedErrors)
        
        return {
          valid: false,
          errors: Object.values(fieldErrors),
          fields: fieldErrors,
          categorizedErrors
        }
      }

      // 2. 执行表单级别校验
      if (config.validate) {
        console.log('[ValidationManager] running form level validation')
        const formValidation = await config.validate(values)
        console.log('[ValidationManager] form validation result:', formValidation)
        return formValidation
      }

      return { valid: true }
    } catch (error) {
      console.error("[ValidationManager] validation error:", error)
      return {
        valid: false,
        errors: ["表单校验出错"],
        fields: {}
      }
    }
  }

  // 统一处理字段级别校验
  static async validateFields(values: any, config: DynamicFormConfig): Promise<Record<string, string>> {
    const errors: Record<string, string> = {}
    console.log('[ValidationManager] validateFields start:', { values, config })

    // 校验基本字段
    for (const field of config.renderConfig.basicFields) {
      console.log('[ValidationManager] validating basic field:', field.name)
      const error = await this.validateField(field, values[field.name], values)
      if (error) {
        console.log('[ValidationManager] field validation error:', { field: field.name, error })
        errors[field.name] = error
      }
    }

    // 校验表格字段
    if (config.renderConfig.table?.columns) {
      console.log('[ValidationManager] validating table fields')
      const tableData = values.tableData || []
      for (let index = 0; index < tableData.length; index++) {
        const row = tableData[index]
        for (const column of config.renderConfig.table.columns) {
          console.log('[ValidationManager] validating table cell:', { column: column.key, rowIndex: index })
          const error = await this.validateTableCell(column, row[column.key], row)
          if (error) {
            console.log('[ValidationManager] table cell validation error:', { 
              column: column.key, 
              rowIndex: index,
              error 
            })
            errors[`tableData.${index}.${column.key}`] = error
          }
        }
      }
    }

    // 校验流程确认字段
    if (config.renderConfig.processSteps) {
      console.log('[ValidationManager] validating process steps')
      const processConfirmations = values.processConfirmations || {}
      for (const step of config.renderConfig.processSteps) {
        if (step.fields) {
          const stepData = processConfirmations[step.key]?.formData || {}
          for (const field of step.fields) {
            console.log('[ValidationManager] validating process step field:', { step: step.key, field: field.name })
            const error = await this.validateField(field, stepData[field.name], stepData)
            if (error) {
              console.log('[ValidationManager] process step field validation error:', {
                step: step.key,
                field: field.name,
                error
              })
              errors[`processConfirmations.${step.key}.formData.${field.name}`] = error
            }
          }
        }
      }
    }

    console.log('[ValidationManager] validateFields complete, errors:', errors)
    return errors
  }

  // 统一处理单个字段校验
  static async validateField(
    field: FormField,
    value: any,
    allValues: any
  ): Promise<string | undefined> {
    console.log('[ValidationManager] validateField start:', { field, value, allValues })
    
    // 必填校验
    if (field.required && (value === undefined || value === null || value === "")) {
      console.log('[ValidationManager] required field validation failed:', field.name)
      return `${field.label}不能为空`
    }

    // 类型校验
    const typeError = this.validateFieldType(field.type, value)
    if (typeError) {
      console.log('[ValidationManager] field type validation failed:', { field: field.name, error: typeError })
      return typeError
    }

    // 自定义校验
    if (field.validators) {
      for (const validator of field.validators) {
        try {
          console.log('[ValidationManager] running custom validator for field:', field.name)
          const error = await Promise.resolve(validator(value, allValues))
          if (error) {
            console.log('[ValidationManager] custom validation failed:', { field: field.name, error })
            return error
          }
        } catch (error) {
          console.error(`[ValidationManager] Validation error for field ${field.name}:`, error)
          return `${field.label}校验出错`
        }
      }
    }

    console.log('[ValidationManager] field validation passed:', field.name)
    return undefined
  }

  // 统一处理表格单元格校验
  static async validateTableCell(
    column: TableColumn,
    value: any,
    row: any
  ): Promise<string | undefined> {
    console.log('[ValidationManager] validateTableCell start:', { column, value, row })
    
    if (column.required && (value === undefined || value === null || value === "")) {
      console.log('[ValidationManager] required table cell validation failed:', column.key)
      return `${column.title}不能为空`
    }

    // 类型校验
    const typeError = this.validateFieldType(column.type, value)
    if (typeError) {
      console.log('[ValidationManager] table cell type validation failed:', { 
        column: column.key, 
        error: typeError 
      })
      return typeError
    }

    console.log('[ValidationManager] table cell validation passed:', column.key)
    return undefined
  }

  // 统一处理字段类型校验
  static validateFieldType(type: string, value: any): string | undefined {
    console.log('[ValidationManager] validateFieldType start:', { type, value })
    
    if (!value) return undefined

    switch (type) {
      case "number":
        if (isNaN(Number(value))) {
          console.log('[ValidationManager] number validation failed')
          return "请输入有效的数字"
        }
        break
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          console.log('[ValidationManager] email validation failed')
          return "请输入有效的邮箱地址"
        }
        break
      case "tel":
        if (!/^1[3-9]\d{9}$/.test(value)) {
          console.log('[ValidationManager] phone validation failed')
          return "请输入有效的手机号码"
        }
        break
      case "url":
        try {
          new URL(value)
        } catch {
          console.log('[ValidationManager] url validation failed')
          return "请输入有效的URL地址"
        }
        break
      case "date":
      case "datetime":
        if (isNaN(Date.parse(value))) {
          console.log('[ValidationManager] date validation failed')
          return "请输入有效的日期"
        }
        break
    }

    console.log('[ValidationManager] field type validation passed')
    return undefined
  }

  // 对错误进行分类
  static categorizeErrors(errors: Record<string, string>): {
    required?: string[]
    invalid?: string[]
    other?: string[]
  } {
    console.log('[ValidationManager] categorizeErrors start:', errors)
    
    const categorized: {
      required?: string[]
      invalid?: string[]
      other?: string[]
    } = {}

    Object.entries(errors).forEach(([field, error]) => {
      if (error.includes("不能为空")) {
        categorized.required = categorized.required || []
        categorized.required.push({
          field,
          message: error
        })
      } else if (
        error.includes("有效") ||
        error.includes("格式") ||
        error.includes("类型")
      ) {
        categorized.invalid = categorized.invalid || []
        categorized.invalid.push({
          field,
          message: error
        })
      } else {
        categorized.other = categorized.other || []
        categorized.other.push({
          field,
          message: error
        })
      }
    })

    console.log('[ValidationManager] categorized errors:', categorized)
    return categorized
  }
}