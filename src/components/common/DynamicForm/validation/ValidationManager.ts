import { DynamicFormConfig, FormField, TableColumn, ValidationResult } from "../types"

export class ValidationManager {
  // 统一处理表单级别校验
  static async validateForm(values: any, config: DynamicFormConfig): Promise<ValidationResult> {
    try {
      // 1. 执行字段级别校验
      const fieldErrors = await this.validateFields(values, config)
      if (Object.keys(fieldErrors).length > 0) {
        // 对错误进行分类
        const categorizedErrors = this.categorizeErrors(fieldErrors)
        
        return {
          valid: false,
          errors: Object.values(fieldErrors),
          fields: fieldErrors,
          categorizedErrors
        }
      }

      // 2. 执行表单级别校验
      if (config.validate) {
        const formValidation = await config.validate(values)
        return formValidation
      }

      return { valid: true }
    } catch (error) {
      console.error("Validation error:", error)
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

    // 校验基本字段
    for (const field of config.renderConfig.basicFields) {
      const error = await this.validateField(field, values[field.name], values)
      if (error) {
        errors[field.name] = error
      }
    }

    // 校验表格字段
    if (config.renderConfig.table?.columns) {
      const tableData = values.tableData || []
      for (let index = 0; index < tableData.length; index++) {
        const row = tableData[index]
        for (const column of config.renderConfig.table.columns) {
          const error = await this.validateTableCell(column, row[column.key], row)
          if (error) {
            errors[`tableData.${index}.${column.key}`] = error
          }
        }
      }
    }

    // 校验流程确认字段
    if (config.renderConfig.processSteps) {
      const processConfirmations = values.processConfirmations || {}
      for (const step of config.renderConfig.processSteps) {
        if (step.fields) {
          for (const field of step.fields) {
            const stepData = processConfirmations[step.key]?.formData || {}
            const error = await this.validateField(field, stepData[field.name], stepData)
            if (error) {
              errors[`processConfirmations.${step.key}.formData.${field.name}`] = error
            }
          }
        }
      }
    }

    return errors
  }

  // 统一处理单个字段校验
  static async validateField(
    field: FormField,
    value: any,
    allValues: any
  ): Promise<string | undefined> {
    // 必填校验
    if (field.required && (value === undefined || value === null || value === "")) {
      return `${field.label}不能为空`
    }

    // 类型校验
    const typeError = this.validateFieldType(field.type, value)
    if (typeError) {
      return typeError
    }

    // 自定义校验
    if (field.validators) {
      for (const validator of field.validators) {
        try {
          const error = await Promise.resolve(validator(value, allValues))
          if (error) {
            return error
          }
        } catch (error) {
          console.error(`Validation error for field ${field.name}:`, error)
          return `${field.label}校验出错`
        }
      }
    }

    return undefined
  }

  // 统一处理表格单元格校验
  static async validateTableCell(
    column: TableColumn,
    value: any,
    row: any
  ): Promise<string | undefined> {
    if (column.required && (value === undefined || value === null || value === "")) {
      return `${column.title}不能为空`
    }

    // 类型校验
    const typeError = this.validateFieldType(column.type, value)
    if (typeError) {
      return typeError
    }

    return undefined
  }

  // 统一处理字段类型校验
  static validateFieldType(type: string, value: any): string | undefined {
    if (!value) return undefined

    switch (type) {
      case "number":
        if (isNaN(Number(value))) {
          return "请输入有效的数字"
        }
        break
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "请输入有效的邮箱地址"
        }
        break
      case "tel":
        if (!/^1[3-9]\d{9}$/.test(value)) {
          return "请输入有效的手机号码"
        }
        break
      case "url":
        try {
          new URL(value)
        } catch {
          return "请输入有效的URL地址"
        }
        break
      case "date":
      case "datetime":
        if (isNaN(Date.parse(value))) {
          return "请输入有效的日期"
        }
        break
    }

    return undefined
  }

  // 对错误进行分类
  static categorizeErrors(errors: Record<string, string>): {
    required?: string[]
    invalid?: string[]
    other?: string[]
  } {
    const categorized: {
      required?: string[]
      invalid?: string[]
      other?: string[]
    } = {}

    Object.values(errors).forEach(error => {
      if (error.includes("不能为空")) {
        categorized.required = categorized.required || []
        categorized.required.push(error)
      } else if (
        error.includes("有效") ||
        error.includes("格式") ||
        error.includes("类型")
      ) {
        categorized.invalid = categorized.invalid || []
        categorized.invalid.push(error)
      } else {
        categorized.other = categorized.other || []
        categorized.other.push(error)
      }
    })

    return categorized
  }
}