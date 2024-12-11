# 资源字段自动填充指南

## 概述

资源字段是动态表单中的一个重要特性，它允许用户从预定义的资源中选择数据，并可以通过配置自动填充其他相关字段。本指南将详细介绍资源字段的自动填充功能及其配置方法。

## 配置说明

### fieldMapping 配置

fieldMapping 是实现自动填充的核心配置，它定义了如何将选中资源的字段映射到表单的其他字段。

```typescript
interface ResourceConfig {
  resourceId: string
  // ... 其他配置
  fieldMapping?: {
    [targetField: string]:
      | string // 简单映射
      | {
          // 复杂映射
          field: string
          fields?: string[]
          condition?: (resource: any) => boolean
          transform?: (value: any) => any
        }
  }
}
```

### 映射类型

#### 1. 简单映射

直接指定源字段到目标字段的映射关系。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "price": "productPrice",     // price 字段将被映射到 productPrice
      "stock": "inventoryCount"    // stock 字段将被映射到 inventoryCount
    }
  }
}
```

#### 2. 带转换的映射

在映射过程中对数据进行转换。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "price": {
        field: "productPrice",
        transform: (value) => Number(value).toFixed(2)  // 转换为两位小数
      }
    }
  }
}
```

#### 3. 条件映射

根据条件决定是否进行映射。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "discount": {
        field: "price",
        condition: (resource) => resource.canDiscount,  // 只有满足条件才映射
        transform: (value) => value * 0.9              // 计算折扣价
      }
    }
  }
}
```

#### 4. 多字段组合映射

将多个字段组合成一个值。

```typescript
{
  resourceConfig: {
    resourceId: "products",
    fieldMapping: {
      "displayName": {
        fields: ["code", "name"],
        transform: (values) => values.join(' - ')  // 组合多个字段
      }
    }
  }
}
```

## 工作原理

### 自动填充流程

1. 用户选择资源后，系统会：

   - 根据 fieldMapping 配置自动填充相关字段
   - 被映射的字段会自动变为只读状态
   - 在字段右侧显示链接图标，表示该字段是自动填充的

2. 映射过程：
   - 系统获取选中的资源数据
   - 遍历 fieldMapping 配置
   - 执行字段映射和数据转换
   - 更新表单数据

## 使用示例

### 销售订单示例

```typescript
{
  columns: [
    {
      key: "product",
      title: "产品",
      type: "resource",
      resourceConfig: {
        resourceId: "products",
        displayFields: [
          { key: "name", label: "产品名称" },
          { key: "code", label: "产品编码" },
        ],
        fieldMapping: {
          // 简单映射
          unitPrice: "price",

          // 带转换的映射
          specification: {
            field: "specs",
            transform: (value) => value.toUpperCase(),
          },

          // 多字段组合
          description: {
            fields: ["name", "specs"],
            transform: (values) => values.join(" - "),
          },
        },
      },
    },
    {
      key: "unitPrice",
      title: "单价",
      type: "number",
      width: "120px",
    },
  ]
}
```

### 采购订单示例

```typescript
{
  columns: [
    {
      key: "material",
      title: "原材料",
      type: "resource",
      resourceConfig: {
        resourceId: "materials",
        displayFields: [
          { key: "name", label: "材料名称" },
          { key: "specification", label: "规格" },
        ],
        fieldMapping: {
          unitPrice: {
            field: "price",
            transform: (value) => Number(value).toFixed(2),
          },
          unit: "measureUnit",
          specification: {
            fields: ["specification", "standard"],
            transform: (values) => values.filter(Boolean).join(" / "),
          },
        },
      },
    },
  ]
}
```

## 最佳实践

### 1. 字段命名

- 使用清晰、语义化的字段名称
- 保持源字段和目标字段的命名一致性
- 避免使用特殊字符和空格

### 2. 数据转换

- 在 transform 函数中处理数据类型转换
- 添加适当的数据验证和错误处理
- 处理空值和异常情况

### 3. 性能优化

- 避免过于复杂的转换逻辑
- 合理使用条件映射
- 缓存频繁使用的计算结果

### 4. 用户体验

- 为自动填充的字段添加清晰的提示
- 确保字段值的可读性
- 提供适当的错误反馈

## 注意事项

1. 被映射的字段会自动变为只读状态
2. 源字段值为空时，目标字段也会被清空
3. 条件映射失败时不会更新目标字段
4. transform 函数应该是纯函数，避免副作用
5. 避免循环映射，可能导致死循环

## 常见问题解答

### Q1: 如何处理字段值为 null 或 undefined 的情况？

建议在 transform 函数中添加适当的默认值处理：

```typescript
{
  transform: (value) => value ?? "-" // 使用空值合并运算符
}
```

### Q2: 如何在映射时进行数据验证？

可以在 condition 中添加验证逻辑：

```typescript
{
  condition: (resource) => {
    if (!resource.price || resource.price < 0) {
      return false // 验证失败，不进行映射
    }
    return true
  }
}
```

### Q3: 如何处理异步转换？

目前不支持异步转换，建议在选择资源前预处理数据。
