```ts
/**
 * @fileoverview 基础类型定义
 * @description 定义了DynamicForm支持的所有基础类型
 * @since 1.0.0
 */

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
 * @example
 * ```typescript
 * const fieldType: FormFieldType = 'text';
 * ```
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
  | "custom"
  | "resource"
  | "signature"
  | "radio"
  | "checkbox"
  | "switch"
  | "slider"
  | "upload"
  | "clockIn"
  | "location"

/**
 * 手动输入字段类型
 * @description 需要用户手动输入的字段类型
 */
export type ManualInputFieldType = "text" | "number" | "email" | "tel" | "textarea" | "select" | "date" | "datetime"

/**
 * 提示配置
 * @description 字段提示信息的配置
 */
export interface TooltipConfig {
  /** 提示内容 */
  content: ReactNode
  /** 提示位置 */
  placement?: "top" | "bottom" | "left" | "right"
}

/**
 * 表单元数据
 * @description 表单的基本信息配置
 *
 * @example
 * ```typescript
 * const metadata: FormMetadata = {
 *   title: '用户信息表单',
 *   description: '请填写用户基本信息',
 * ```
 */
export interface FormMetadata {
  /** 表单标题 */
  title: string
  /** 表单描述 */
  description?: string
  /** 权限配置 */
  permissions?: {
    /** 是否可编辑 */
    edit?: boolean
    /** 是否可删除 */
    delete?: boolean
    /** 是否可打印 */
    print?: boolean
  }
}
```