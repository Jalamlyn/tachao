import { ReactNode } from "react"

/**
 * 表单字段类型定义
 * @description 定义了DynamicForm支持的所有字段类型
 * 
 * 基础输入类型:
 * - text: 单行文本输入
 * - password: 密码输入,自动隐藏内容 
 * - number: 数字输入,支持整数和小数
 * - email: 邮箱输入,自带邮箱格式验证
 * - tel: 电话号码输入
 * - url: URL地址输入
 * 
 * 扩展输入类型:
 * - textarea: 多行文本输入,适用于长文本
 * - select: 下拉选择框
 * - date: 日期选择
 * - datetime: 日期时间选择
 * 
 * 特殊输入类型:
 * - file: (已废弃)文件上传,请使用upload类型
 * - image: (已废弃)图片上传,请使用upload类型
 * - upload: 统一的上传组件,支持文件、图片等
 * - signature: 手写签名
 * - custom: 自定义组件
 * 
 * 选择类型:
 * - radio: 单选框组
 * - checkbox: 复选框组
 * - switch: 开关
 * - slider: 滑块
 * 
 * 资源类型:
 * - resource: 资源选择器,用于选择主数据
 * 
 * 使用建议:
 * 1. 文本输入优先使用text类型
 * 2. 数值输入使用number类型,并配置min/max限制
 * 3. 日期选择使用date/datetime类型
 * 4. 文件上传统一使用upload类型,配置uploadType
 * 5. 选项选择使用select/radio/checkbox
 * 6. 开关量使用switch类型
 * 7. 资源选择使用resource类型
 * 8. 需要自定义渲染时使用custom类型
 */
export type FormFieldType =
  | "text"
  | "password" 
  | "number"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "date"
  | "datetime"
  | "file"
  | "image"
  | "custom"
  | "resource"
  | "signature"
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"
  | "upload"

/**
 * 手动输入字段类型
 * @description 需要用户手动输入的字段类型
 */
export type ManualInputFieldType = "text" | "number" | "email" | "tel" | "textarea" | "select" | "date" | "datetime"

export interface TooltipConfig {
  content: ReactNode
  placement?: "top" | "bottom" | "left" | "right"
}

export interface FormMetadata {
  title: string
  description?: string
  permissions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
  }
}