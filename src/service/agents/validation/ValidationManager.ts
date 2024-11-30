import { DynamicFormConfig, FormField, TableColumn, ValidationResult, FormFieldGroup } from "../types"
import { aiLog } from "@/utils/AITraceLogger"

export class ValidationManager {
  // 统一处理表单级别校验
  static async validateForm(values: any, config: DynamicFormConfig): Promise<ValidationResult> {
    const traceId = aiLog.start()
    try {
      aiLog.log("[ValidationManager] validateForm start", { values, config })

      // 1. 执行字段级别校验
      const fieldErrors = await this.validateFields(values, config)
      aiLog.log("[ValidationManager] field validation results", fieldErrors)

      if (Object.keys(fieldErrors).length > 0) {
        // 对错误进行分类
        const categorizedErrors = this.categorizeErrors(fieldErrors)
        aiLog.log("[ValidationManager] categorized errors", categorizedErrors)

        return {
          valid: false,
          errors: Object.values(fieldErrors),
          fields: fieldErrors,
          categorizedErrors,
        }
      }

      // 2. 执行表单级别校验
      if (config.validate) {
        aiLog.log("[ValidationManager] running form level validation")
        const formValidation = await config.validate(values)
        aiLog.log("[ValidationManager] form validation result", formValidation)
        return formValidation
      }

      return { valid: true }
    } catch (error) {
      aiLog.error(error as Error)
      return {
        valid: false,
        errors: ["表单校验出错"],
        fields: {},
      }
    } finally {
      aiLog.print(traceId)
    }
  }

  private static async validateGroupFields(
    groups: FormFieldGroup[],
    values: any,
    parentPath: string = ''
  ): Promise<Record<string, string>> {
    const traceId = aiLog.start()
    aiLog.log("[ValidationManager] validateGroupFields start", { groups, values, parentPath })
    
    const errors: Record<string, string> = {}
    
    for (const group of groups) {
      aiLog.log(`[ValidationManager] validating group: ${group.title}`, { groupKey: group.key })
      for (const field of group.fields) {
        const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name
        const fieldValue = parentPath ? values?.[field.name] : values?.[field.name]
        
        aiLog.log(`[ValidationManager] validating field in group`, {
          group: group.title,
          field: field.name,
          fieldPath,
          fieldValue
        })
        
        const error = await this.validateField(field, fieldValue, values)
        
        if (error) {
          errors[fieldPath] = `[${group.title}] ${error}`
          aiLog.log(`[ValidationManager] field validation error in group`, {
            group: group.title,
            field: field.name,
            error
          })
        }
      }
    }
    
    aiLog.log("[ValidationManager] validateGroupFields complete", { errors })
    aiLog.print(traceId)
    return errors
  }

  // 统一处理字段级别校验
  static async validateFields(values: any, config: DynamicFormConfig): Promise<Record<string, string>> {
    const traceId = aiLog.start()
    const errors: Record<string, string> = {}
    aiLog.log("[ValidationManager] validateFields start", { values, config })

    try {
      // 校验基本字段
      const basicFields = config.renderConfig.basicFields
      aiLog.log("[ValidationManager] basic fields structure", { 
        isArray: Array.isArray(basicFields),
        hasGroups: !Array.isArray(basicFields) && basicFields?.groups,
        basicFields 
      })

      if (Array.isArray(basicFields)) {
        // 处理字段数组
        for (const field of basicFields) {
          aiLog.log("[ValidationManager] validating basic field", { fieldName: field.name })
          const error = await this.validateField(field, values[field.name], values)
          if (error) {
            aiLog.log("[ValidationManager] field validation error", { field: field.name, error })
            errors[field.name] = error
          }
        }
      } else if (basicFields.groups) {
        // 处理分组字段
        aiLog.log("[ValidationManager] validating grouped fields", { 
          groupCount: basicFields.groups.length,
          groups: basicFields.groups.map(g => g.title)
        })
        const groupErrors = await this.validateGroupFields(basicFields.groups, values)
        Object.assign(errors, groupErrors)
      }

      // 校验表格字段
      if (config.renderConfig.table?.columns) {
        aiLog.log("[ValidationManager] validating table fields")
        const tableData = values.tableData || []
        for (let index = 0; index < tableData.length; index++) {
          const row = tableData[index]
          for (const column of config.renderConfig.table.columns) {
            aiLog.log("[ValidationManager] validating table cell", { column: column.key, rowIndex: index })
            const error = await this.validateTableCell(column, row[column.key], row)
            if (error) {
              aiLog.log("[ValidationManager] table cell validation error", {
                column: column.key,
                rowIndex: index,
                error,
              })
              errors[`tableData.${index}.${column.key}`] = error
            }
          }
        }
      }

      // 校验流程确认字段
      if (config.renderConfig.processSteps) {
        aiLog.log("[ValidationManager] validating process steps")
        const processConfirmations = values.processConfirmations || {}
        for (const step of config.renderConfig.processSteps) {
          if (step.fields) {
            const stepData = processConfirmations[step.key]?.formData || {}
            aiLog.log("[ValidationManager] validating process step", {
              stepKey: step.key,
              stepData
            })
            const stepErrors = await this.validateGroupFields(
              [{ key: step.key, title: step.title, fields: step.fields }],
              stepData,
              `processConfirmations.${step.key}.formData`
            )
            Object.assign(errors, stepErrors)
          }
        }
      }

      aiLog.log("[ValidationManager] validateFields complete", { errors })
      return errors
    } catch (error) {
      aiLog.error(error as Error)
      throw error
    } finally {
      aiLog.print(traceId)
    }
  }

  // 统一处理单个字段校验
  static async validateField(field: FormField, value: any, allValues: any): Promise<string | undefined> {
    const traceId = aiLog.start()
    aiLog.log("[ValidationManager] validateField start", { field, value, allValues })

    try {
      // 必填校验
      if (field.required) {
        if (field.type === "resource") {
          // 对resource类型进行特殊处理
          if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
            aiLog.log("[ValidationManager] resource field validation failed - empty value", { fieldName: field.name })
            return `${field.label}不能为空`
          }
          // 检查资料对象的关键属性是否存在
          const requiredProps = ["id", "title"] // 可以根据实际需求调整必需属性
          const missingProps = requiredProps.filter((prop) => !value[prop])
          if (missingProps.length > 0) {
            aiLog.log("[ValidationManager] resource field validation failed - missing properties", {
              field: field.name,
              missingProps,
            })
            return `${field.label}数据不完整`
          }
        } else if (value === undefined || value === null || value === "") {
          aiLog.log("[ValidationManager] required field validation failed", { fieldName: field.name })
          return `${field.label}不能为空`
        }
      }

      // 类型校验
      const typeError = this.validateFieldType(field.type, value)
      if (typeError) {
        aiLog.log("[ValidationManager] field type validation failed", { field: field.name, error: typeError })
        return typeError
      }

      // 自定义校验
      if (field.validators) {
        for (const validator of field.validators) {
          try {
            aiLog.log("[ValidationManager] running custom validator for field", { fieldName: field.name })
            const error = await Promise.resolve(validator(value, allValues))
            if (error) {
              aiLog.log("[ValidationManager] custom validation failed", { field: field.name, error })
              return error
            }
          } catch (error) {
            aiLog.error(error as Error)
            return `${field.label}校验出错`
          }
        }
      }

      aiLog.log("[ValidationManager] field validation passed", { fieldName: field.name })
      return undefined
    } finally {
      aiLog.print(traceId)
    }
  }

  // 统一处理表格单元格校验
  static async validateTableCell(column: TableColumn, value: any, row: any): Promise<string | undefined> {
    const traceId = aiLog.start()
    aiLog.log("[ValidationManager] validateTableCell start", { column, value, row })

    try {
      if (column.required) {
        if (column.type === "resource") {
          // 对表格中的resource类型进行特殊处理
          if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
            aiLog.log("[ValidationManager] table resource cell validation failed", { columnKey: column.key })
            return `${column.title}不能为空`
          }
          // 检查资料对象的关键属性是否存在
          const requiredProps = ["id", "title"]
          const missingProps = requiredProps.filter((prop) => !value[prop])
          if (missingProps.length > 0) {
            aiLog.log("[ValidationManager] table resource cell validation failed - missing properties", {
              column: column.key,
              missingProps,
            })
            return `${column.title}数据不完整`
          }
        } else if (value === undefined || value === null || value === "") {
          aiLog.log("[ValidationManager] required table cell validation failed", { columnKey: column.key })
          return `${column.title}不能为空`
        }
      }

      // 类型校验
      const typeError = this.validateFieldType(column.type, value)
      if (typeError) {
        aiLog.log("[ValidationManager] table cell type validation failed", {
          column: column.key,
          error: typeError,
        })
        return typeError
      }

      aiLog.log("[ValidationManager] table cell validation passed", { columnKey: column.key })
      return undefined
    } finally {
      aiLog.print(traceId)
    }
  }

  // 统一处理字段类型校验
  static validateFieldType(type: string, value: any): string | undefined {
    const traceId = aiLog.start()
    aiLog.log("[ValidationManager] validateFieldType start", { type, value })

    try {
      if (!value) return undefined
      switch (type) {
        case "resource":
          if (value && typeof value === "object") {
            // 资料类型的基本格式验证
            if (!value.id || !value.title) {
              aiLog.log("[ValidationManager] resource validation failed - invalid format")
              return "资料数据格式无效"
            }
          }
          break
        case "signature":
          if (typeof value === "string" && /^data:image\/[a-z]+;base64,/.test(value)) {
            return undefined
          }
          return "请输入有效的signature数据"
        case "number":
          if (isNaN(Number(value))) {
            aiLog.log("[ValidationManager] number validation failed")
            return "请输入有效的数字"
          }
          break
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            aiLog.log("[ValidationManager] email validation failed")
            return "请输入有效的邮箱地址"
          }
          break
        case "tel":
          if (!/^1[3-9]\d{9}$/.test(value)) {
            aiLog.log("[ValidationManager] phone validation failed")
            return "请输入有效的手机号码"
          }
          break
        case "url":
          try {
            new URL(value)
          } catch {
            aiLog.log("[ValidationManager] url validation failed")
            return "请输入有效的URL地址"
          }
          break
        case "date":
        case "datetime":
          if (isNaN(Date.parse(value))) {
            aiLog.log("[ValidationManager] date validation failed")
            return "请输入有效的日期"
          }
          break
      }

      aiLog.log("[ValidationManager] field type validation passed")
      return undefined
    } finally {
      aiLog.print(traceId)
    }
  }

  // 对错误进行分类
  static categorizeErrors(errors: Record<string, string>): {
    required?: Array<{ field: string; message: string }>
    invalid?: Array<{ field: string; message: string }>
    other?: Array<{ field: string; message: string }>
  } {
    const traceId = aiLog.start()
    aiLog.log("[ValidationManager] categorizeErrors start", { errors })

    try {
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

      aiLog.log("[ValidationManager] categorized errors", { categorized })
      return categorized
    } finally {
      aiLog.print(traceId)
    }
  }
}