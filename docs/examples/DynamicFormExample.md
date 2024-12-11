# 动态表单使用示例

本文档提供了一个完整的动态表单配置示例,涵盖了所有可用的功能和配置选项。

## 完整示例

```typescript
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"

const formConfig: DynamicFormConfig = {
  // 表单元数据配置
  metadata: {
    title: "采购申请单",
    description: "用于提交采购申请的电子表单",
    permissions: {
      edit: true,
      delete: true,
      print: true
    }
  },

  // 渲染配置
  renderConfig: {
    // 基础字段配置 - 使用分组
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:information",
          description: "请填写申请的基本信息",
          fields: [
            {
              name: "department",
              label: "申请部门",
              type: "resource",
              required: true,
              resourceConfig: {
                resourceId: "departments",
                displayField: "name",
                displayFields: [
                  { key: "name", label: "部门名称" },
                  { key: "code", label: "部门代码" }
                ],
                fieldMapping: {
                  // 自动填充部门主管
                  "departmentManager": {
                    field: "manager",
                    transform: (value) => ({
                      dataid: value.id,
                      displayValue: value.name
                    })
                  },
                  // 自动填充成本中心
                  "costCenter": "costCenter"
                }
              }
            },
            {
              name: "departmentManager",
              label: "部门主管",
              type: "resource",
              required: true,
              disabled: true,
              resourceConfig: {
                resourceId: "employees",
                displayFields: [
                  { key: "name", label: "姓名" },
                  { key: "position", label: "职位" }
                ]
              }
            },
            {
              name: "costCenter",
              label: "成本中心",
              type: "text",
              required: true,
              disabled: true
            },
            {
              name: "requestDate",
              label: "申请日期",
              type: "date",
              required: true
            }
          ]
        },
        {
          key: "purpose",
          title: "申请用途",
          icon: "mdi:target",
          description: "请说明采购用途和预算情况",
          fields: [
            {
              name: "purpose",
              label: "采购用途",
              type: "textarea",
              required: true,
              placeholder: "请详细说明采购物品的用途..."
            },
            {
              name: "budgetType",
              label: "预算类型",
              type: "select",
              required: true,
              options: [
                { label: "部门预算", value: "department" },
                { label: "项目预算", value: "project" },
                { label: "临时预算", value: "temporary" }
              ]
            },
            {
              name: "projectId",
              label: "关联项目",
              type: "resource",
              required: true,
              hidden: true, // 默认隐藏,仅当预算类型为项目预算时显示
              resourceConfig: {
                resourceId: "projects",
                displayFields: [
                  { key: "name", label: "项目名称" },
                  { key: "code", label: "项目编号" },
                  { key: "manager", label: "项目经理" }
                ]
              }
            },
            {
              name: "urgencyLevel",
              label: "紧急程度",
              type: "radio",
              required: true,
              options: [
                { label: "普通", value: "normal" },
                { label: "紧急", value: "urgent" },
                { label: "特急", value: "critical" }
              ]
            },
            {
              name: "expectedDeliveryDate",
              label: "预期交付日期",
              type: "date",
              required: true
            }
          ]
        },
        {
          key: "attachments",
          title: "附件信息",
          icon: "mdi:attachment",
          description: "上传相关附件",
          fields: [
            {
              name: "quotation",
              label: "报价单",
              type: "upload",
              required: true,
              uploadConfig: {
                uploadType: "file",
                maxSize: 10 * 1024 * 1024, // 10MB
                maxCount: 3,
                uploadConfig: {
                  action: "/api/upload",
                  headers: {
                    "X-Upload-Type": "quotation"
                  }
                }
              }
            },
            {
              name: "specifications",
              label: "规格说明书",
              type: "upload",
              uploadConfig: {
                uploadType: "file",
                maxSize: 20 * 1024 * 1024, // 20MB
                maxCount: 5
              }
            }
          ]
        }
      ]
    },

    // 表格配置
    tables: [
      {
        key: "items",
        title: "采购明细",
        icon: "mdi:table",
        description: "请填写需要采购的物品明细",
        config: {
          columns: [
            {
              key: "material",
              title: "物料",
              type: "resource",
              width: 300,
              required: true,
              resourceConfig: {
                resourceId: "materials",
                displayFields: [
                  { key: "name", label: "名称" },
                  { key: "code", label: "编号" },
                  { key: "specification", label: "规格" }
                ],
                showTrigger: true,
                triggerPosition: "right",
                fieldMapping: {
                  "unit": "unit",
                  "unitPrice": {
                    field: "price",
                    transform: (value) => Number(value).toFixed(2)
                  }
                }
              }
            },
            {
              key: "specification",
              title: "规格",
              type: "text",
              width: 200
            },
            {
              key: "quantity",
              title: "数量",
              type: "number",
              width: 120,
              required: true
            },
            {
              key: "unit",
              title: "单位",
              type: "text",
              width: 80,
              disabled: true
            },
            {
              key: "unitPrice",
              title: "单价",
              type: "number",
              width: 120,
              required: true
            },
            {
              key: "amount",
              title: "金额",
              type: "number",
              width: 120,
              disabled: true,
              render: (value, record) => {
                const amount = (record.quantity || 0) * (record.unitPrice || 0)
                return amount.toFixed(2)
              }
            },
            {
              key: "remark",
              title: "备注",
              type: "text",
              width: 200
            }
          ],
          summary: {
            show: true,
            label: "合计",
            className: "font-bold",
            style: { backgroundColor: "#f5f5f5" }
          }
        }
      }
    ],

    // 流程步骤配置
    processSteps: [
      {
        key: "applicant",
        title: "申请人确认",
        icon: "mdi:account-check",
        description: "申请人确认申请信息",
        required: true,
        fields: [
          {
            name: "confirmDate",
            label: "确认日期",
            type: "date",
            required: true
          },
          {
            name: "signature",
            label: "签名",
            type: "signature",
            required: true,
            width: 300,
            height: 150
          }
        ]
      },
      {
        key: "manager",
        title: "部门主管审批",
        icon: "mdi:account-supervisor",
        description: "部门主管审核申请",
        required: true,
        dependencies: [
          {
            step: "applicant",
            message: "需要先完成申请人确认"
          }
        ],
        fields: [
          {
            name: "approved",
            label: "审批结果",
            type: "radio",
            required: true,
            options: [
              { label: "同意", value: "approved" },
              { label: "拒绝", value: "rejected" }
            ]
          },
          {
            name: "comment",
            label: "审批意见",
            type: "textarea",
            required: true
          }
        ]
      },
      {
        key: "finance",
        title: "财务审核",
        icon: "mdi:currency-usd",
        description: "财务部门审核预算",
        required: true,
        dependencies: [
          {
            step: "manager",
            condition: {
              field: "approved",
              value: "approved"
            },
            message: "需要部门主管审批通过"
          }
        ],
        fields: [
          {
            name: "budgetAvailable",
            label: "预算情况",
            type: "radio",
            required: true,
            options: [
              { label: "预算充足", value: "sufficient" },
              { label: "预算不足", value: "insufficient" }
            ]
          },
          {
            name: "budgetAccount",
            label: "预算科目",
            type: "select",
            required: true,
            options: [
              { label: "办公用品", value: "office" },
              { label: "固定资产", value: "assets" },
              { label: "其他支出", value: "others" }
            ]
          },
          {
            name: "comment",
            label: "审核意见",
            type: "textarea",
            required: true
          }
        ]
      }
    ]
  },

  // 订单号配置
  orderNumberConfig: {
    prefix: "PO",
    fieldName: "orderNumber",
    label: "采购单号"
  },

  // 表单监听函数
  watch: (form) => {
    // 监听预算类型变化
    const subscription = form.watch("budgetType", (value) => {
      // 当预算类型为项目预算时显示关联项目字段
      form.setValue("projectId.hidden", value !== "project")
    })

    // 返回清理函数
    return () => subscription.unsubscribe()
  },

  // 表单验证
  validate: async (values) => {
    const errors = []

    // 验证总金额不超过预算
    const items = values.tableData?.items || []
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unitPrice || 0)
    }, 0)

    if (totalAmount > 100000) {
      errors.push("采购总金额不能超过100,000")
    }

    // 验证交付日期
    const deliveryDate = new Date(values.expectedDeliveryDate)
    const today = new Date()
    if (deliveryDate < today) {
      errors.push("预期交付日期不能早于今天")
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default formConfig
```

## 配置说明

### 1. 元数据配置

```typescript
metadata: {
  title: string           // 表单标题
  description?: string    // 表单描述
  permissions?: {         // 权限配置
    edit?: boolean       // 是否可编辑
    delete?: boolean     // 是否可删除
    print?: boolean      // 是否可打印
  }
}
```

### 2. 基础字段配置

支持两种模式:
- 简单模式: 直接配置字段数组
- 分组模式: 将字段分组配置

#### 2.1 字段类型

- 基础输入类型
  - text: 文本输入
  - password: 密码输入
  - number: 数字输入
  - email: 邮箱输入
  - tel: 电话号码
  - url: URL地址

- 扩展输入类型
  - textarea: 多行文本
  - select: 下拉选择
  - date: 日期选择
  - datetime: 日期时间选择

- 特殊输入类型
  - upload: 文件上传
  - signature: 手写签名
  - custom: 自定义组件

- 选择类型
  - radio: 单选框组
  - checkbox: 复选框组
  - switch: 开关
  - slider: 滑块

- 资源类型
  - resource: 资源选择器

#### 2.2 字段配置

```typescript
interface FormField {
  name: string           // 字段名
  label: string          // 显示标签
  type: FormFieldType    // 字段类型
  required?: boolean     // 是否必填
  disabled?: boolean     // 是否禁用
  hidden?: boolean       // 是否隐藏
  placeholder?: string   // 占位提示
  className?: string     // 自定义类名
  style?: CSSProperties  // 自定义样式
  tooltip?: {            // 提示配置
    content: ReactNode
    placement?: 'top' | 'bottom' | 'left' | 'right'
  }
  validators?: Array<(value: any) => string | undefined>  // 自定义验证
}
```

### 3. 表格配置

```typescript
interface TableConfig {
  columns: TableColumn[]     // 列配置
  toolbar?: ReactNode        // 工具栏
  summary?: {                // 汇总配置
    show?: boolean
    label?: string
    className?: string
    style?: CSSProperties
  }
}
```

#### 3.1 列配置

```typescript
interface TableColumn {
  key: string            // 列键名
  title: string          // 列标题
  type: FormFieldType    // 列类型
  width?: number         // 列宽度
  required?: boolean     // 是否必填
  disabled?: boolean     // 是否禁用
  render?: (value: any, record: any) => ReactNode  // 自定义渲染
}
```

### 4. 流程步骤配置

```typescript
interface ProcessStep {
  key: string           // 步骤键名
  title: string         // 步骤标题
  description?: string  // 步骤描述
  icon?: string         // 步骤图标
  required?: boolean    // 是否必须
  fields?: FormField[]  // 步骤字段
  dependencies?: Array<{  // 步骤依赖
    step: string
    condition?: {
      field?: string
      value?: any
      custom?: (data: any) => boolean
    }
    message?: string
  }>
}
```

### 5. 资源选择器配置

```typescript
interface ResourceConfig {
  resourceId: string     // 资源ID
  multiple?: boolean     // 是否多选
  displayField?: string  // 显示字段
  displayFields?: Array<{  // 显示字段配置
    key: string
    label: string
    width?: string | number
    render?: (value: any) => ReactNode
  }>
  fieldMapping?: {       // 字段映射
    [targetField: string]: string | {
      field: string
      transform?: (value: any) => any
    }
  }
}
```

## 使用示例

```tsx
import { DynamicForm } from "@/components/common/DynamicForm"
import formConfig from "./formConfig"

const PurchaseRequestForm = () => {
  const handleSubmit = async (validationResult, values) => {
    if (validationResult.valid) {
      // 处理表单提交
      console.log("Form values:", values)
    }
  }

  return (
    <DynamicForm
      config={formConfig}
      onSubmit={handleSubmit}
      isCreateMode={true}
    />
  )
}

export default PurchaseRequestForm
```

## 注意事项

1. 字段联动
- 使用watch函数监听字段变化
- 通过form.setValue更新其他字段

2. 表格计算
- 使用render函数实现计算列
- 可以访问当前行的所有数据

3. 资源选择
- 配置fieldMapping实现自动填充
- 使用displayFields自定义显示内容

4. 流程控制
- 使用dependencies配置步骤依赖
- 可以添加自定义条件控制

5. 文件上传
- 配置uploadConfig自定义上传行为
- 支持多种文件类型和预览

6. 表单验证
- 支持字段级验证和表单级验证
- 可以实现复杂的业务规则验证