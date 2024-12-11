/**
 * @fileoverview 表单配置类型定义
 * @description 定义了动态表单的配置接口和相关类型
 * @since 1.0.0
 */

import { UseFormReturn } from "react-hook-form"
import { FormField, FormFieldGroup } from "./field"
import { TableConfig, TableGroup } from "./table"
import { ProcessStep } from "./process"
import { FormMetadata } from "./basic"
import { ValidationContext, ValidationResult, ValidationRule, FormEventHandlers } from "./validation"

/**
 * 订单号字段配置
 * @description 配置表单的订单号生成规则
 */
export interface OrderNumberFieldConfig {
  /** 前缀 */
  prefix?: string
  /** 字段名 */
  fieldName?: string
  /** 显示标签 */
  label?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 更新标记 */
  isUpdating?: number
  /** 是否为创建模式 */
  isCreateMode?: boolean
}

/**
 * 表单渲染配置
 * @description 配置表单的渲染结构
 */
export interface FormRenderConfig {
  /** 基础字段配置 */
  basicFields:
    | FormField[]
    | {
        /** 字段分组 */
        groups: FormFieldGroup[]
        /** 默认分组 */
        defaultGroup?: string
      }
  /** 表格配置(单表格) */
  table?: TableConfig
  /** 表格配置(多表格) */
  tables?: TableGroup[]
  /** 流程步骤 */
  processSteps?: ProcessStep[]
}

/**
 * 动态表单配置
 * @description 动态表单的完整配置接口
 * 
 * @example
 * ```typescript
 * const config: DynamicFormConfig = {
 *   metadata: {
 *     title: '用户信息表单',
 *     description: '请填写用户基本信息'
 *   },
 *   renderConfig: {
 *     basicFields: [
 *       { name: 'username', label: '用户名', type: 'text' }
 *     ]
 *   }
 * }
 * ```
 */
export interface DynamicFormConfig {
  /** 表单元数据 */
  metadata: FormMetadata
  /** 渲染配置 */
  renderConfig: FormRenderConfig
  /** 订单号配置 */
  orderNumberConfig?: OrderNumberFieldConfig
  /** 表单监听函数 */
  watch?: (form: UseFormReturn<any>) => () => void
  /** 表单验证函数 */
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult
  /** 验证规则 */
  validationRules?: Record<string, ValidationRule>
  /** 事件处理器 */
  eventHandlers?: FormEventHandlers
}

/**
 * 动态表单Props
 * @description 动态表单组件的Props类型
 */
export interface DynamicFormProps {
  /** 表单配置 */
  config: DynamicFormConfig
  /** 表单ID */
  id?: string
  /** 提交回调 */
  onSubmit?: (validationResult: ValidationResult, values: any) => Promise<void>
  /** 取消回调 */
  onCancel?: () => void
  /** 模板ID */
  templateId?: string
  /** 是否为创建模式 */
  isCreateMode?: boolean
  /** 是否为预览模式 */
  previewMode?: boolean
  /** 初始值 */
  initialValues?: any
}