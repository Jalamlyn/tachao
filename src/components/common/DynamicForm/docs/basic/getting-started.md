# DynamicForm 快速开始

## 简介

DynamicForm 是一个功能强大的动态表单组件，支持：
- 基础表单字段
- 动态表格
- 流程步骤
- 表单联动
- 自定义验证
- 打印预览

## 安装

DynamicForm 组件已经内置在项目中，无需额外安装。

## 基础用法

### 1. 创建表单配置

```typescript
const formConfig = {
  metadata: {
    title: "基础表单",
    description: "这是一个基础表单示例",
    permissions: {
      edit: true,
      delete: true,
      print: true
    }
  },
  renderConfig: {
    basicFields: [
      {
        name: "title",
        label: "标题",
        type: "text",
        required: true
      },
      {
        name: "description",
        label: "描述",
        type: "textarea"
      }
    ]
  }
}
```

### 2. 使用组件

```tsx
import DynamicForm from "@/components/common/DynamicForm"

export default function MyForm() {
  const handleSubmit = async (validationResult, values) => {
    if (validationResult.valid) {
      console.log("Form values:", values)
    }
  }

  return (
    <DynamicForm
      config={formConfig}
      onSubmit={handleSubmit}
    />
  )
}
```

## 核心概念

### 1. 配置对象

配置对象是定义表单结构和行为的核心，包含：
- metadata: 表单元数据
- renderConfig: 渲染配置
- watch: 表单联动
- validate: 自定义验证

### 2. 字段类型

支持多种字段类型，详见 [字段类型文档](../field-types.md)

### 3. 表单联动

支持复杂的表单联动逻辑，详见 [表单联动文档](../advanced/form-linkage.md)

### 4. 表格功能

支持动态表格功能，详见 [表格特性文档](../advanced/table-features.md)

## 最佳实践

1. 配置组织
```typescript
// 将配置拆分为多个部分
const config = {
  metadata: {...},
  renderConfig: {
    basicFields: [...],
    tables: [...],
    processSteps: [...]
  },
  watch: (form) => {...},
  validate: async (values) => {...}
}
```

2. 错误处理
```typescript
const handleSubmit = async (validationResult, values) => {
  try {
    if (!validationResult.valid) {
      console.error("Validation errors:", validationResult.errors)
      return
    }
    await saveForm(values)
  } catch (error) {
    console.error("Submit error:", error)
  }
}
```

3. 性能优化
```typescript
// 使用 watch 时注意性能
watch: (form) => {
  let isCalculating = false
  const subscription = form.watch((value, { name }) => {
    if (!isCalculating && name === "targetField") {
      isCalculating = true
      try {
        // 执行计算
      } finally {
        isCalculating = false
      }
    }
  })
  return () => subscription.unsubscribe()
}
```

## 常见问题

1. 表单值不更新
- 检查 watch 函数是否正确实现
- 确保返回了取消订阅函数

2. 验证不生效
- 检查字段的 required 属性
- 检查自定义验证函数的返回值

3. 表格计算错误
- 使用标志位防止递归
- 只监听必要的字段变化

## 下一步

- 查看 [配置详细说明](./configuration.md)
- 了解 [高级特性](../advanced/form-linkage.md)
- 浏览 [示例代码](../examples/basic-forms.md)