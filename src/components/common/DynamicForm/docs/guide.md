# 动态表单配置指南

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
