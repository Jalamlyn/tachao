# FormulaService 文档

## 简介

FormulaService 是一个用于安全计算公式的服务。它主要用于 DynamicForm 组件中的表格计算，但也可以在其他需要动态计算的场景中使用。

## 主要功能

1. 安全的公式计算
2. 公式验证
3. 错误处理

## 使用方法

### 初始化

FormulaService 使用单例模式，你可以通过以下方式获取实例：

```typescript
import { formulaService } from '@/services/formulaService';
```

### 计算公式

使用 `safeEvaluateFormula` 方法来计算公式：

```typescript
const { value, error } = formulaService.safeEvaluateFormula(formula, row);
```

参数：
- `formula`: 字符串类型，表示要计算的公式
- `row`: 对象类型，包含公式中使用的变量

返回值：
- `value`: 计算结果
- `error`: 如果计算出错，这里会包含错误信息

### 示例

```typescript
const row = { quantity: 5, unitPrice: 10, discount: 0.1 };
const formula = "row.quantity * row.unitPrice * (1 - row.discount)";

const { value, error } = formulaService.safeEvaluateFormula(formula, row);

if (error) {
  console.error("计算错误:", error);
} else {
  console.log("计算结果:", value);
}
```

## 安全性

FormulaService 实现了基本的安全检查，禁止了一些可能造成安全问题的 JavaScript 函数，如 `eval`、`Function`、`setTimeout` 和 `setInterval`。

## 注意事项

1. 公式中可以使用 `row` 对象来访问传入的变量。
2. 公式支持基本的数学运算和 Formula.js 提供的函数。
3. 为了安全起见，某些 JavaScript 函数在公式中是被禁止的。
4. 如果计算出错，`safeEvaluateFormula` 方法不会抛出异常，而是返回一个包含错误信息的对象。

## 性能考虑

虽然 FormulaService 提供了安全的公式计算，但在处理大量数据或复杂公式时，仍然需要注意性能问题。建议在使用时进行适当的性能测试，并考虑使用缓存或其他优化策略。

## 未来改进

1. 支持更多的数学函数和操作。
2. 实现更细粒度的安全控制，允许用户自定义允许和禁止的函数。
3. 添加公式解析和优化功能，以提高计算效率。

FormulaService 为 DynamicForm 和其他需要动态计算的场景提供了强大而安全的支持。通过使用这个服务，你可以在应用中实现复杂的计算逻辑，同时保证安全性和可维护性。