# 动态表单配置指南

## 简介

动态表单配置是一个强大的工具，允许您通过 JavaScript 对象配置来定义复杂的表单结构和行为，而无需编写大量的 React 代码。本文档将详细介绍如何正确配置动态表单，以满足各种业务需求。

## 主要特性

1. 基础表单字段
- 支持多种输入类型
- 字段验证
- 条件显示
- 字段联动

2. 表格数据
- 动态行操作
- 列配置
- 自动计算
- 汇总统计

3. 流程确认
- 多步骤审批
- 条件审批
- 并行审批
- 审批历史

4. 打印导出
- 自定义打印模板
- PDF导出
- 打印预览
- 分页控制

## 配置结构概览

```typescript
interface DynamicFormConfig {
  // 元数据配置
  metadata: {
    title: string;              // 表单标题
    description?: string;       // 表单描述
    permissions?: {            // 权限控制
      edit?: boolean;         // 编辑权限
      delete?: boolean;       // 删除权限
      print?: boolean;        // 打印权限
    }
  };

  // 渲染配置
  renderConfig: {
    basicFields: FormField[];    // 基础字段
    table?: TableConfig;         // 表格配置
    processSteps?: ProcessStep[]; // 流程步骤
  };

  // 单号配置
  orderNumberConfig?: {
    prefix?: string;            // 单号前缀
    fieldName?: string;         // 字段名称
    label?: string;             // 字段标签
  };

  // 表单验证
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult;

  // 字段联动
  watch?: (form: UseFormReturn<any>) => (() => void);
}
```

## 快速开始

1. 基础配置示例:

```typescript
const config: DynamicFormConfig = {
  metadata: {
    title: "请假申请单",
    description: "用于员工请假申请",
    permissions: {
      edit: true,
      print: true
    }
  },
  renderConfig: {
    basicFields: [
      {
        name: "name",
        label: "申请人",
        type: "text",
        required: true
      },
      {
        name: "leaveType",
        label: "请假类型",
        type: "select",
        options: [
          { label: "年假", value: "annual" },
          { label: "病假", value: "sick" }
        ]
      }
    ]
  }
};
```

2. 使用组件:

```tsx
import DynamicForm from "@/components/common/DynamicForm";

function App() {
  return (
    <DynamicForm 
      config={config}
      onSubmit={async (values) => {
        console.log(values);
      }}
    />
  );
}
```

## 注意事项

1. 配置验证
- 确保所有必需字段都已配置
- 检查字段名称是否唯一
- 验证选项值的有效性

2. 性能考虑
- 避免过多的字段联动
- 合理使用缓存
- 优化验证逻辑

3. 兼容性
- 支持移动端适配
- 考虑打印兼容性
- 处理浏览器差异

## 下一步

- 查看[字段配置](./fields.md)了解更多字段类型
- 查看[表格配置](./table.md)了解表格功能
- 查看[流程配置](./process.md)了解审批流程
- 查看[最佳实践](./best-practices.md)了解使用技巧