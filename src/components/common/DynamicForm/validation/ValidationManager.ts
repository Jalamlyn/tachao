import { DynamicFormConfig, FormField, TableColumn, ValidationResult, FormFieldGroup } from "../types"
import { get, set } from "lodash"

export class ValidationManager {
  // 统一处理表单级别校验
  static async validateForm(values: any, config: DynamicFormConfig): Promise<ValidationResult> {
    try {
      // 1. 收集所有需要校验的字段
      const fields = this.collectFormFields(config)

      // 2. 执行字段校验
      const errors: Record<string, string> = {}

      for (const field of fields) {
        const value = get(values, field.path)
        const error = await this.validateField(field, value, values)
        if (error) {
          errors[field.path] = error
        }
      }

      if (Object.keys(errors).length > 0) {
        // 对错误进行分类
        const categorizedErrors = this.categorizeErrors(errors)

        return {
          valid: false,
          errors: Object.values(errors),
          fields: errors,
          categorizedErrors,
        }
      }

      // 3. 执行表单级别校验
      if (config.validate) {
        const formValidation = await config.validate(values)
        return formValidation
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        errors: ["表单校验出错"],
        fields: {},
      }
    }
  }

  // 收集所有需要校验的字段
  private static collectFormFields(config: DynamicFormConfig): Array<{
    path: string
    label: string
    type: string
    required?: boolean
    validation?: any
    validators?: Array<(value: any, allValues?: any) => string | undefined>
  }> {
    const fields: any[] = []

    // 处理基本字段
    const basicFields = config.renderConfig.basicFields
    if (basicFields) {
      if ("groups" in basicFields) {
        // 处理分组字段
        basicFields.groups.forEach((group) => {
          group.fields.forEach((field) => {
            const fieldConfig = {
              ...field,
              path: field.name,
            }
            
            // 处理custom类型字段的validation
            if (field.type === 'custom' && field.validation) {
              fieldConfig.validation = field.validation
            }
            
            fields.push(fieldConfig)
          })
        })
      } else if (Array.isArray(basicFields)) {
        // 处理字段数组
        basicFields.forEach((field) => {
          const fieldConfig = {
            ...field,
            path: field.name,
          }
          
          // 处理custom类型字段的validation
          if (field.type === 'custom' && field.validation) {
            fieldConfig.validation = field.validation
          }
          
          fields.push(fieldConfig)
        })
      }
    }

    // 处理表格字段
    if (config.renderConfig.table?.columns) {
      config.renderConfig.table.columns.forEach((column) => {
        if (column.required) {
          fields.push({
            path: `tableData.${column.key}`,
            label: column.title,
            type: column.type,
            required: true,
          })
        }
      })
    }

    // 处理流程确认字段
    if (config.renderConfig.processSteps) {
      config.renderConfig.processSteps.forEach((step) => {
        if (step.fields) {
          step.fields.forEach((field) => {
            fields.push({
              ...field,
              path: `processConfirmations.${step.key}.formData.${field.name}`,
            })
          })
        }
      })
    }

    return fields
  }

  // 校验单个字段
  private static async validateField(
    field: {
      path: string
      label: string
      type: string
      required?: boolean
      validation?: any
      validators?: Array<(value: any, allValues?: any) => string | undefined>
    },
    value: any,
    allValues: any
  ): Promise<string | undefined> {
    try {
      // 处理custom类型字段的validation
      if (field.type === 'custom' && field.validation) {
        // 处理required验证
        if (field.validation.required && (!value || (Array.isArray(value) && value.length === 0))) {
          return typeof field.validation.required === 'string' 
            ? field.validation.required 
            : `${field.label}不能为空`
        }

        // 处理validate对象
        if (field.validation.validate) {
          const validateObj = field.validation.validate
          
          // 如果validate是函数
          if (typeof validateObj === 'function') {
            const result = await validateObj(value, allValues)
            if (typeof result === 'string') return result
          }
          
          // 如果validate是对象
          if (typeof validateObj === 'object') {
            for (const [key, validator] of Object.entries(validateObj)) {
              if (typeof validator === 'function') {
                const result = await validator(value, allValues)
                if (typeof result === 'string') return result
              }
            }
          }
        }
      }

      // 必填校验
      if (field.required) {
        if (field.type === "resource") {
          if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
            return `${field.label}不能为空`
          }
        } else if (value === undefined || value === null || value === "") {
          return `${field.label}不能为空`
        }
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
            return `${field.label}校验出错`
          }
        }
      }

      return undefined
    } catch (error) {
      throw error
    }
  }

  // 校验字段类型
  private static validateFieldType(type: string, value: any): string | undefined {
    if (!value) return undefined

    switch (type) {
      case "resource":
        break
      case "signature":
        if (typeof value === "string" && /^data:image\/[a-z]+;base64,/.test(value)) {
          return undefined
        }
        return "请输入有效的signature数据"
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
  private static categorizeErrors(errors: Record<string, string>): {
    required?: Array<{ field: string; message: string }>
    invalid?: Array<{ field: string; message: string }>
    other?: Array<{ field: string; message: string }>
  } {
    const categorized: {
      required?: Array<{ field: string; message: string }>
      invalid?: Array<{ field: string; message: string }>
      other?: Array<{ field: string; message: string }>
    } = {}

    Object.entries(errors).forEach(([field, error]) => {
      // 提取分组信息（如果存在）
      const groupMatch = error.match(/\[(.*?)\]/)
      const groupInfo = groupMatch ? groupMatch[1] + " - " : ""
      const cleanError = error.replace(/\[.*?\]\s*/, "")

      if (cleanError.includes("不能为空") || cleanError.includes("数据不完整")) {
        categorized.required = categorized.required || []
        categorized.required.push({
          field,
          message: `${groupInfo}${cleanError}`,
        })
      } else if (cleanError.includes("有效") || cleanError.includes("格式") || cleanError.includes("类型")) {
        categorized.invalid = categorized.invalid || []
        categorized.invalid.push({
          field,
          message: `${groupInfo}${cleanError}`,
        })
      } else {
        categorized.other = categorized.other || []
        categorized.other.push({
          field,
          message: `${groupInfo}${cleanError}`,
        })
      }
    })

    return categorized
  }
}