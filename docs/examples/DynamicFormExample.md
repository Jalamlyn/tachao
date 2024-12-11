# 动态表单使用示例

本文档提供了一个完整的动态表单配置示例。

## 配置类型说明

```typescript
/**
 * 动态表单配置类型定义
 * @interface DynamicFormConfig
 */
interface DynamicFormConfig {
  /** 
   * 表单元数据配置
   * @type {object} 
   */
  metadata: {
    /** 表单标题 @type {string} */
    title: string
    /** 表单描述 @type {string} */
    description?: string
    /** 
     * 权限配置 
     * @type {object}
     */
    permissions: {
      /** 是否可编辑 @type {boolean} */
      edit?: boolean
      /** 是否可删除 @type {boolean} */
      delete?: boolean
      /** 是否可打印 @type {boolean} */
      print?: boolean
    }
  }

  /** 
   * 渲染配置
   * @type {object} 
   */
  renderConfig: {
    /** 
     * 基础字段配置
     * @type {object} 
     */
    basicFields: {
      /** 
       * 字段分组
       * @type {array} 
       */
      groups: Array<{
        /** 分组键名 @type {string} */
        key: string
        /** 分组标题 @type {string} */
        title: string
        /** 分组图标 @type {string} */
        icon?: string
        /** 分组描述 @type {string} */
        description?: string
        /** 
         * 字段列表
         * @type {array} 
         */
        fields: Array<{
          /** 字段名 @type {string} */
          name: string
          /** 字段标签 @type {string} */
          label: string
          /** 
           * 字段类型
           * @type {string}
           * @enum {string} 
           * - 'text' - 文本输入
           * - 'number' - 数字输入
           * - 'password' - 密码输入
           * - 'email' - 邮箱输入
           * - 'tel' - 电话输入
           * - 'textarea' - 多行文本
           * - 'select' - 下拉选择
           * - 'radio' - 单选
           * - 'checkbox' - 多选
           * - 'switch' - 开关
           * - 'date' - 日期
           * - 'datetime' - 日期时间
           * - 'resource' - 资源选择
           * - 'upload' - 文件上传
           * - 'signature' - 签名
           * - 'custom' - 自定义
           */
          type: string
          /** 是否必填 @type {boolean} */
          required?: boolean
          /** 是否禁用 @type {boolean} */
          disabled?: boolean
          /** 
           * 资源配置 - 仅type为resource时有效
           * @type {object} 
           */
          resourceConfig?: {
            /** 资源ID @type {string} */
            resourceId: string
            /** 显示字段 @type {string} */
            displayField?: string
            /** 
             * 显示字段配置
             * @type {array} 
             */
            displayFields?: Array<{
              /** 字段键名 @type {string} */
              key: string
              /** 字段标签 @type {string} */
              label: string
            }>
            /** 
             * 显示格式化函数
             * @type {function} 
             */
            displayFormat?: (resource: any) => string
            /** 
             * 触发器配置
             * @type {object} 
             */
            triggerConfig?: {
              /** 
               * 触发器类型
               * @type {string}
               * @enum {string}
               * - 'button' - 按钮
               * - 'icon' - 图标
               */
              type: 'button' | 'icon'
              /** 按钮文本 @type {string} */
              text?: string
              /** 图标名称 @type {string} */
              icon?: string
              /** 自定义类名 @type {string} */
              className?: string
            }
            /** 
             * 字段映射配置
             * @type {object} 
             */
            fieldMapping?: {
              [key: string]: string | {
                /** 源字段 @type {string} */
                field: string
                /** 源字段列表 @type {string[]} */
                fields?: string[]
                /** 
                 * 条件函数
                 * @type {function} 
                 */
                condition?: (resource: any) => boolean
                /** 
                 * 转换函数
                 * @type {function} 
                 */
                transform?: (value: any) => any
              }
            }
          }
          /** 
           * 上传配置 - 仅type为upload时有效
           * @type {object} 
           */
          uploadConfig?: {
            /** 
             * 上传类型
             * @type {string}
             * @enum {string}
             * - 'file' - 文件
             * - 'image' - 图片
             * - 'video' - 视频
             * - 'audio' - 音频
             */
            uploadType: 'file' | 'image' | 'video' | 'audio'
            /** 是否多选 @type {boolean} */
            multiple?: boolean
            /** 最大文件大小(字节) @type {number} */
            maxSize?: number
            /** 最大文件数量 @type {number} */
            maxCount?: number
            /** 是否显示缩略图 @type {boolean} */
            thumbnail?: boolean
          }
        }>
      }>
    }

    /** 
     * 表格配置
     * @type {array} 
     */
    tables?: Array<{
      /** 表格键名 @type {string} */
      key: string
      /** 表格标题 @type {string} */
      title: string
      /** 表格图标 @type {string} */
      icon?: string
      /** 表格描述 @type {string} */
      description?: string
      /** 
       * 表格配置
       * @type {object} 
       */
      config: {
        /** 
         * 列配置
         * @type {array} 
         */
        columns: Array<{
          /** 列键名 @type {string} */
          key: string
          /** 列标题 @type {string} */
          title: string
          /** 列类型 @type {string} */
          type: string
          /** 列宽度 @type {number | string} */
          width?: number | string
          /** 是否必填 @type {boolean} */
          required?: boolean
          /** 是否禁用 @type {boolean} */
          disabled?: boolean
          /** 
           * 列汇总配置
           * @type {object} 
           */
          summary?: {
            /** 
             * 汇总渲染函数
             * @type {function} 
             */
            render: (records: any[]) => React.ReactNode
          }
        }>
        /** 
         * 表格汇总配置
         * @type {object} 
         */
        summary?: {
          /** 是否显示汇总行 @type {boolean} */
          show?: boolean
          /** 汇总标签 @type {string} */
          label?: string
          /** 自定义类名 @type {string} */
          className?: string
        }
      }
    }>

    /** 
     * 流程步骤配置
     * @type {array} 
     */
    processSteps?: Array<{
      /** 步骤键名 @type {string} */
      key: string
      /** 步骤标题 @type {string} */
      title: string
      /** 步骤图标 @type {string} */
      icon?: string
      /** 步骤描述 @type {string} */
      description?: string
      /** 是否必须 @type {boolean} */
      required?: boolean
      /** 
       * 步骤依赖
       * @type {array} 
       */
      dependencies?: Array<{
        /** 依赖步骤 @type {string} */
        step: string
        /** 依赖消息 @type {string} */
        message?: string
      }>
      /** 字段列表 @type {array} */
      fields?: Array<FormField>
    }>
  }

  /** 
   * 订单号配置
   * @type {object} 
   */
  orderNumberConfig?: {
    /** 前缀 @type {string} */
    prefix?: string
    /** 字段名 @type {string} */
    fieldName?: string
    /** 显示标签 @type {string} */
    label?: string
  }

  /** 
   * 表单监听函数
   * @type {function} 
   */
  watch?: (form: UseFormReturn<any>) => () => void

  /** 
   * 表单验证函数
   * @type {function} 
   */
  validate?: (values: any) => Promise<{
    /** 是否验证通过 @type {boolean} */
    valid: boolean
    /** 错误信息 @type {string[]} */
    errors?: string[]
    /** 字段错误 @type {object} */
    fields?: Record<string, string>
    /** 
     * 分类错误
     * @type {object} 
     */
    categorizedErrors?: {
      /** 必填错误 @type {array} */
      required?: Array<{
        /** 字段名 @type {string} */
        field: string
        /** 错误信息 @type {string} */
        message: string
      }>
      /** 验证错误 @type {array} */
      invalid?: Array<{
        /** 字段名 @type {string} */
        field: string
        /** 错误信息 @type {string} */
        message: string
      }>
      /** 其他错误 @type {array} */
      other?: Array<{
        /** 字段名 @type {string} */
        field: string
        /** 错误信息 @type {string} */
        message: string
      }>
    }
  }>
}
```

## 完整示例

[原有的完整示例代码保持不变...]

## 使用示例

[原有的使用示例代码保持不变...]