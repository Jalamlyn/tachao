# 动态表单配置指南

## 简介

动态表单配置是一个强大的工具，允许您通过 JavaScript 对象配置来定义复杂的表单结构和行为，而无需编写大量的 React 代码。本文档将详细介绍如何正确配置动态表单，以满足各种业务需求。

## 配置结构概览

```typescript
interface DynamicFormConfig {
  metadata: FormMetadata;
  renderConfig: FormRenderConfig;
  orderNumberConfig?: OrderNumberConfig;
  validate?: (values: any, context?: ValidationContext) => Promise<ValidationResult> | ValidationResult;
  dependencies?: DependencyConfig;
}
```