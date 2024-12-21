```ts
/**
 * @fileoverview 表单字段类型定义
 * @description 定义了表单字段的详细配置和相关接口
 * @since 1.0.0
 */

import { ReactNode } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormFieldType, ManualInputFieldType, TooltipConfig } from "./basic"

/**
 * 渲染Props类型定义
 * @description 自定义渲染组件的Props类型
 */
export interface FormFieldRenderProps {
  field: any
  form: UseFormReturn<any>
  isEditable: boolean
  onChange?: (fieldName: string, value: any) => void
}

/**
 * 资源字段显示配置
 * @description 配置资源字段在表单中的显示方式
 */
export interface ResourceDisplayField {
  /** 字段键名 */
  key: string
  /** 显示标签 */
  label: string
  /** 表格模式下的列宽 */
  width?: string | number
  /** 自定义渲染函数 */
  render?: (value: any) => React.ReactNode
}

/**
 * 触发器配置
 * @description 资源选择触发器的配置
 */
export interface ResourceTriggerConfig {
  /** 触发器类型 */
  type: "button" | "icon"
  /** 按钮文本 */
  text?: string
  /** 图标名称 */
  icon?: string
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 字段样式配置
 * @description 配置表单字段的样式
 */
export interface FieldStyle {
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 内边距 */
  padding?: string | number
  /** 外边距 */
  margin?: string | number
  /** 显示方式 */
  display?: 'block' | 'inline-block' | 'flex'
  /** 跨列数 */
  colSpan?: number
  /** 文本对齐 */
  textAlign?: 'left' | 'center' | 'right'
  /** 小屏样式 */
  sm?: Partial<FieldStyle>
  /** 中屏样式 */
  md?: Partial<FieldStyle>
  /** 大屏样式 */
  lg?: Partial<FieldStyle>
  /** 自定义样式 */
  custom?: React.CSSProperties
}

/**
 * 资源配置
 * @description 资源选择器的完整配置
 */
export interface ResourceConfig {
  /** 资料标题 */
  resourceTitle?: string
  /** 资料ID */
  resourceId: string
  /** 是否支持多选 */
  multiple?: boolean
  /** 显示模式 */
  displayMode?: "card"
  /** 显示字段配置 */
  displayFields?: ResourceDisplayField[]
  /** 显示字段名 */
  displayField?: string
  /** 自定义显示格式化函数 */
  displayFormat?: (resource: any) => string
  /** 触发器配置 */
  triggerConfig?: ResourceTriggerConfig
  /** 字段映射配置 */
  fieldMapping?: {
    [targetField: string]:
      | string
      | {
          field: string
          fields?: string[]
          condition?: (resource: any) => boolean
          transform?: (value: any) => any
        }
  }
}

/**
 * 资源字段值类型
 * @description 资源选择器的值类型
 */
export interface ResourceValue {
  /** 数据ID */
  dataid: string | string[]
  /** 显示值 */
  displayValue?: string
}

/**
 * 文件信息
 * @description 上传文件的信息
 */
export interface FileInfo {
  /** 文件ID */
  fileId: string
  /** 文件名 */
  fileName: string
  /** 文件Key */
  fileKey: string
  /** 下载URL */
  downloadUrl?: string
  /** 文件类型 */
  type?: string
  /** 文件大小 */
  size?: number
}

/**
 * 表单字段
 * @description 表单字段的完整配置
 */
export interface FormField {
  /** 字段名 */
  name: string
  /** 显示标签 */
  label: string
  /** 字段类型 */
  type: FormFieldType
  /** 占位提示 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否必填 */
  required?: boolean
  /** 提示配置 */
  tooltip?: TooltipConfig
  /** 验证器 */
  validators?: Array<(value: any, allValues?: any) => string | undefined>
  /** 选项配置 */
  options?:
    | Array<{
        label: string
        value: string | number
        disabled?: boolean
      }>
    | ((form: UseFormReturn<any>) => Array<{
        label: string
        value: string | number
        disabled?: boolean
      }>)
  /** 文件接受类型 */
  accept?: string
  /** 资源配置 */
  resourceConfig?: ResourceConfig
  /** 自定义渲染函数 */
  render?: (props: FormFieldRenderProps) => ReactNode
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number
  /** 线宽 */
  lineWidth?: number
  /** 线条颜色 */
  lineColor?: string
  /** 自定义类名 */
  className?: string
  /** 选中时的标签 */
  checkedLabel?: string
  /** 未选中时的标签 */
  uncheckedLabel?: string
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 布局方式 */
  layout?: "default" | "full-width" | "inline"
  /** 路径 */
  path?: string
  /** 样式配置 */
  style?: FieldStyle
  /** 自定义样式 */
  customStyle?: React.CSSProperties
  /** 上传配置 */
  uploadConfig?: {
    /** 上传类型 */
    uploadType: "file" | "image" | "video" | "audio"
    /** 是否支持多选 */
    multiple?: boolean
    /** 最大文件大小 */
    maxSize?: number
    /** 最大文件数量 */
    maxCount?: number
    /** 是否显示缩略图 */
    thumbnail?: boolean
    /** 裁剪选项 */
    cropOptions?: {
      /** 宽高比 */
      aspect?: number
      /** 质量 */
      quality?: number
      /** 宽度 */
      width?: number
      /** 高度 */
      height?: number
    }
    /** 上传配置 */
    uploadConfig?: {
      /** 上传地址 */
      action?: string
      /** 请求头 */
      headers?: Record<string, string>
      /** 是否携带凭证 */
      withCredentials?: boolean
      /** 自定义上传请求 */
      customRequest?: (options: any) => Promise<any>
    }
    /** 上传成功回调 */
    onSuccess?: (fileInfo: FileInfo) => void
    /** 上传失败回调 */
    onError?: (error: Error) => void
    /** 上传进度回调 */
    onProgress?: (percent: number) => void
    /** 预览回调 */
    onPreview?: (file: FileInfo) => void
    /** 下载回调 */
    onDownload?: (file: FileInfo) => void
    /** 预览配置 */
    previewConfig?: {
      /** 预览宽度 */
      width?: number | string
      /** 预览高度 */
      height?: number | string
      /** 模态框标题 */
      modalTitle?: string
      /** 模态框宽度 */
      modalWidth?: number | string
    }
    /** 下载配置 */
    downloadConfig?: {
      /** 请求方法 */
      method?: "GET" | "POST"
      /** 请求头 */
      headers?: Record<string, string>
      /** 是否携带凭证 */
      withCredentials?: boolean
      /** 超时时间 */
      timeout?: number
    }
  }
}

/**
 * 表单字段分组
 * @description 表单字段的分组配置
 */
export interface FormFieldGroup {
  /** 分组键名 */
  key: string
  /** 分组标题 */
  title: string
  /** 字段列表 */
  fields: FormField[]
  /** 分组描述 */
  description?: string
  /** 分组图标 */
  icon?: string
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}
```