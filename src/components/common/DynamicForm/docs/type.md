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
           * - 'clockIn' - 打卡
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
              type: "button" | "icon"
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
              [key: string]:
                | string
                | {
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
            uploadType: "file" | "image" | "video" | "audio"
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
    tables: Array<{
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
           * 自定义渲染函数
           * @type {function}
           * @param value - 当前单元格的值
           * @param record - 当前行的数据记录
           * @returns {React.ReactNode} 返回要渲染的内容
           * @example
           * // 基础用法
           * render: (value, record) => value
           *
           * // 带空值检查
           * render: (value, record) => {
           *   if (!record || !record.someField) {
           *     return '默认值'
           *   }
           *   return record.someField
           * }
           *
           * // 计算场景
           * render: (value, record) => {
           *   if (!record?.field1 || !record?.field2) {
           *     return '0.00'
           *   }
           *   return calculateValue(record.field1, record.field2)
           * }
           */
          render?: (value: any, record: any) => React.ReactNode
          /**
           * 列汇总配置
           * @type {object}
           */
          summary?: {
            /**
             * 汇总渲染函数
             * @type {function}
             * @param records - 所有数据记录
             * @returns {React.ReactNode} 返回要渲染的汇总内容
             * @example
             * summary: {
             *   render: (records) => {
             *     const total = records.reduce((sum, record) =>
             *       sum + (record.amount || 0), 0)
             *     return total.toFixed(2)
             *   }
             * }
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
    processSteps: Array<{
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
最佳实践和注意事项
1. 表格列渲染
在配置表格列的render函数时，请注意以下最佳实践：

// 1. 基础用法 - 始终进行空值检查
render: (value, record) => {
  if (!value) return '-'
  return value
}

// 2. 访问嵌套属性 - 使用可选链操作符
render: (value, record) => {
  return record?.parent?.child?.name || '-'
}

// 3. 计算场景 - 确保所有依赖值都存在
render: (value, record) => {
  if (!record?.quantity || !record?.price) {
    return '0.00'
  }
  return (record.quantity * record.price).toFixed(2)
}

// 4. 复杂渲染 - 拆分逻辑提高可读性
render: (value, record) => {
  const formatValue = (val) => {
    if (!val) return '0.00'
    return Number(val).toFixed(2)
  }

  const getDisplayValue = () => {
    if (!record) return '-'
    return `${formatValue(record.amount)} ${record.currency || 'CNY'}`
  }

  return getDisplayValue()
}
2. 资源选择配置
配置资源选择字段时的注意事项：

resourceConfig: {
  // 1. 始终提供显示字段配置
  displayFields: [
    { key: "name", label: "名称" },
    { key: "code", label: "编号" }
  ],

  // 2. 使用displayFormat提供更灵活的显示
  displayFormat: (resource) => {
    if (!resource) return ''
    return `${resource.name} (${resource.code})`
  },

  // 3. 字段映射要处理空值情况
  fieldMapping: {
    "targetField": {
      fields: ["sourceField"],
      transform: (values) => {
        if (!values?.[0]) return null
        return {
          value: values[0],
          display: `自定义显示: ${values[0]}`
        }
      }
    }
  }
}
3. 表单验证
实现表单验证时的最佳实践：

validate: async (values) => {
  const errors = {
    fields: {},
    categorizedErrors: {
      required: [],
      invalid: [],
      other: []
    }
  }

  // 1. 分类处理错误
  if (!values.required_field) {
    errors.fields.required_field = "此字段为必填"
    errors.categorizedErrors.required.push({
      field: "required_field",
      message: "此字段为必填"
    })
  }

  // 2. 业务规则验证
  if (values.end_date && values.start_date > values.end_date) {
    errors.fields.end_date = "结束日期不能早于开始日期"
    errors.categorizedErrors.invalid.push({
      field: "end_date",
      message: "结束日期不能早于开始日期"
    })
  }

  // 3. 复杂验证逻辑
  const validateComplexRule = () => {
    // 复杂验证逻辑
  }

  return {
    valid: Object.keys(errors.fields).length === 0,
    errors: Object.values(errors.fields),
    fields: errors.fields,
    categorizedErrors: errors.categorizedErrors
  }
}
4. 常见问题解答
新增表格行时的默认值处理
// 在表格配置中添加默认值处理
config: {
  defaultRowData: {
    quantity: 0,
    price: 0,
    amount: '0.00'
  }
}
资源选择后的数据联动
// 在resourceConfig中配置fieldMapping
resourceConfig: {
  fieldMapping: {
    "relatedField": {
      field: "sourceField",
      transform: (value) => {
        // 处理联动逻辑
        return transformedValue
      }
    }
  }
}
表单步骤依赖控制
processSteps: [
  {
    key: "step2",
    dependencies: [
      {
        step: "step1",
        message: "请先完成步骤1"
      }
    ],
    // 添加条件判断
    condition: (values) => {
      return values.step1_field === 'completed'
    }
  }
]
```
