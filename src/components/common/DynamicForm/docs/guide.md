# 动态表单配置指南

本文档用于指导AI生成动态表单配置代码。

## 类型定义

### 基础类型
```typescript
// 表单字段类型
type FieldType = 
  | "text"      // 文本输入
  | "password"  // 密码输入
  | "number"    // 数字输入
  | "email"     // 邮箱输入
  | "tel"       // 电话输入
  | "url"       // URL输入
  | "textarea"  // 多行文本
  | "select"    // 下拉选择
  | "date"      // 日期选择
  | "datetime"  // 日期时间
  | "radio"     // 单选框
  | "checkbox"  // 复选框
  | "switch"    // 开关
  | "slider"    // 滑块
  | "upload"    // 文件上传
  | "resource"  // 资源选择
  | "signature" // 签名
  | "custom"    // 自定义组件

// 表单配置
interface FormConfig {
  // 元数据
  metadata: {
    title: string
    description?: string
    permissions?: {
      edit?: boolean
      delete?: boolean
      print?: boolean
    }
  }
  // 渲染配置
  renderConfig: {
    // 基础字段
    basicFields: FormField[] | {
      groups: FormFieldGroup[]
      defaultGroup?: string
    }
    // 表格配置
    table?: TableConfig
    // 多表格配置
    tables?: TableGroup[]
    // 流程步骤
    processSteps?: ProcessStep[]
  }
  // 单号配置
  orderNumberConfig?: {
    prefix?: string
    fieldName?: string
    label?: string
  }
}
```

## 配置示例

### 1. 基础表单
```typescript
const basicFormConfig = {
  metadata: {
    title: "用户信息表单",
    description: "用于收集用户基本信息"
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true,
        placeholder: "请输入姓名"
      },
      {
        name: "age",
        label: "年龄", 
        type: "number",
        min: 0,
        max: 150
      },
      {
        name: "gender",
        label: "性别",
        type: "select",
        options: [
          { label: "男", value: "male" },
          { label: "女", value: "female" }
        ]
      },
      {
        name: "birthday",
        label: "出生日期",
        type: "date"
      },
      {
        name: "email",
        label: "邮箱",
        type: "email",
        validators: [
          (value) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return "请输入有效的邮箱地址"
            }
          }
        ]
      }
    ]
  }
}
```

### 2. 分组表单
```typescript
const groupFormConfig = {
  metadata: {
    title: "员工信息表"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "basic",
          title: "基本信息",
          icon: "mdi:account",
          fields: [
            {
              name: "name",
              label: "姓名",
              type: "text",
              required: true
            },
            {
              name: "employeeId",
              label: "工号",
              type: "text",
              required: true
            }
          ]
        },
        {
          key: "contact",
          title: "联系方式",
          icon: "mdi:phone",
          fields: [
            {
              name: "phone",
              label: "电话",
              type: "tel",
              required: true
            },
            {
              name: "email",
              label: "邮箱",
              type: "email"
            },
            {
              name: "address",
              label: "地址",
              type: "textarea"
            }
          ]
        }
      ]
    }
  }
}
```

### 3. 表格表单
```typescript
const tableFormConfig = {
  metadata: {
    title: "订单表单"
  },
  renderConfig: {
    basicFields: [
      {
        name: "orderNo",
        label: "订单编号",
        type: "text",
        required: true
      },
      {
        name: "customerName",
        label: "客户名称",
        type: "text",
        required: true
      }
    ],
    table: {
      columns: [
        {
          key: "product",
          title: "商品",
          type: "resource",
          width: "300px",
          resourceConfig: {
            resourceId: "products",
            displayField: "name",
            fieldMapping: {
              "price": "price",
              "unit": "unit"
            }
          }
        },
        {
          key: "quantity",
          title: "数量",
          type: "number",
          width: "120px"
        },
        {
          key: "price",
          title: "单价",
          type: "number",
          width: "120px"
        },
        {
          key: "amount",
          title: "金额",
          type: "number",
          width: "120px",
          editable: false
        }
      ],
      summary: {
        show: true,
        label: "合计"
      }
    }
  }
}
```

### 4. 流程表单
```typescript
const processFormConfig = {
  metadata: {
    title: "请假申请"
  },
  renderConfig: {
    basicFields: [
      {
        name: "employeeName",
        label: "申请人",
        type: "text",
        required: true
      },
      {
        name: "department",
        label: "部门",
        type: "text",
        required: true
      }
    ],
    processSteps: [
      {
        key: "apply",
        title: "申请信息",
        icon: "mdi:file-document-edit",
        fields: [
          {
            name: "leaveType",
            label: "请假类型",
            type: "select",
            required: true,
            options: [
              { label: "事假", value: "personal" },
              { label: "病假", value: "sick" },
              { label: "年假", value: "annual" }
            ]
          },
          {
            name: "startDate",
            label: "开始日期",
            type: "date",
            required: true
          },
          {
            name: "endDate",
            label: "结束日期",
            type: "date",
            required: true
          },
          {
            name: "reason",
            label: "请假原因",
            type: "textarea",
            required: true
          }
        ]
      },
      {
        key: "supervisor",
        title: "主管审批",
        icon: "mdi:account-check",
        description: "需要主管审批通过",
        fields: [
          {
            name: "approved",
            label: "审批结果",
            type: "radio",
            options: [
              { label: "同意", value: "approved" },
              { label: "拒绝", value: "rejected" }
            ]
          },
          {
            name: "comment",
            label: "审批意见",
            type: "textarea"
          }
        ]
      },
      {
        key: "hr",
        title: "人事确认",
        icon: "mdi:account-check",
        description: "人事部门最终确认",
        fields: [
          {
            name: "confirmed",
            label: "确认结果",
            type: "radio",
            options: [
              { label: "确认", value: "confirmed" },
              { label: "退回", value: "returned" }
            ]
          },
          {
            name: "hrComment",
            label: "确认意见",
            type: "textarea"
          }
        ]
      }
    ]
  }
}
```

## 使用说明

1. 向AI描述你的表单需求，例如：
```
请帮我生成一个订单表单配置，包含：
1. 基本信息：
   - 订单编号（必填）
   - 客户名称（必填）
   - 下单日期
2. 商品明细（表格）：
   - 商品名称（资源选择）
   - 数量
   - 单价
   - 金额（自动计算）
3. 审批流程：
   - 销售确认
   - 主管审批
```

2. AI会根据类型定义和示例生成符合要求的配置代码

## 最佳实践

1. 需求描述要清晰具体：
   - 列出所有需要的字段
   - 说明字段类型和特殊要求
   - 描述表单的业务逻辑

2. 合理组织字段：
   - 相关字段放在一组
   - 使用合适的字段类型
   - 添加必要的字段说明

3. 表单验证：
   - 必填字段使用required
   - 添加自定义验证规则
   - 设置合理的错误提示

4. 资源选择：
   - 配置正确的资源ID
   - 设置字段映射关系
   - 处理选择后的联动

5. 流程设计：
   - 明确每个步骤的职责
   - 设置步骤依赖关系
   - 配置合理的表单字段

## 特殊功能配置

### 1. 字段联动
```typescript
{
  watch: (form) => {
    // 监听字段变化
    const subscription = form.watch((value, { name }) => {
      if (name === "productId") {
        // 更新其他字段
        form.setValue("price", value.price)
      }
    })
    
    // 返回清理函数
    return () => subscription.unsubscribe()
  }
}
```

### 2. 自定义验证
```typescript
{
  validators: [
    async (value) => {
      // 异步验证
      const exists = await checkExists(value)
      if (exists) {
        return "该值已存在"
      }
    },
    (value, allValues) => {
      // 关联字段验证
      if (value < allValues.minValue) {
        return "不能小于最小值"
      }
    }
  ]
}
```

### 3. 条件显示
```typescript
{
  hidden: (values) => {
    return values.type !== "special"
  }
}
```

### 4. 自定义渲染
```typescript
{
  type: "custom",
  render: ({ field, form, isEditable }) => {
    return <CustomComponent {...field} disabled={!isEditable} />
  }
}
```

## 注意事项

1. 字段命名要有意义，便于理解和维护
2. 合理使用字段类型，提升用户体验
3. 添加适当的字段说明和提示
4. 处理好字段间的依赖关系
5. 注意表单性能，避免过多的联动
6. 妥善处理异常情况
7. 保持配置代码的可读性

## 常见问题

1. 字段值不更新
   - 检查字段名是否正确
   - 确认watch配置是否正确
   - 验证setValue调用是否成功

2. 验证不生效
   - 检查required配置
   - 确认validators函数返回值
   - 验证trigger调用时机

3. 表格操作异常
   - 检查表格配置是否完整
   - 确认字段类型是否正确
   - 验证数据格式是否符合要求

4. 流程步骤问题
   - 检查步骤配置是否正确
   - 确认依赖关系是否合理
   - 验证表单数据是否完整

## 配置模板

### 1. 基础表单模板
```typescript
const baseTemplate = {
  metadata: {
    title: "",
    description: ""
  },
  renderConfig: {
    basicFields: []
  }
}
```

### 2. 完整表单模板
```typescript
const fullTemplate = {
  metadata: {
    title: "",
    description: "",
    permissions: {
      edit: true,
      delete: true,
      print: true
    }
  },
  renderConfig: {
    basicFields: {
      groups: []
    },
    table: {
      columns: []
    },
    processSteps: []
  },
  orderNumberConfig: {
    prefix: "",
    fieldName: "",
    label: ""
  }
}
```

## 结语

本文档提供了动态表单配置的基本指南。通过参考类型定义和示例，结合实际需求，可以快速生成所需的表单配置代码。如有特殊需求，可以基于基础配置进行扩展。