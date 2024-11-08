## Watch 函数配置

watch 函数是处理表单动态逻辑的核心机制，它提供了一种统一的方式来处理字段依赖、条件显示和计算等动态行为。

### 基本结构

```typescript
interface DynamicFormConfig {
  // ...其他配置
  watch?: (form: UseFormReturn<any>) => (() => void)
}
```

### 基本用法

```typescript
const formConfig: DynamicFormConfig = {
  // ... 其他配置
  watch: (form) => {
    // 直接使用 watch，让 React Hook Form 处理清理
    form.watch("fieldName", (value) => {
      // 处理字段变化
      console.log("field changed:", value);
    });

    // 返回空的清理函数
    return () => {};
  }
};
```

### 自动清理机制

React Hook Form 的 watch 机制内置了自动清理功能，在大多数情况下**不需要**手动清理 watch 订阅。

```typescript
// ✅ 推荐写法 - 不需要手动清理
watch: (form) => {
  form.watch(["startDate", "endDate"], ([startDate, endDate]) => {
    if (startDate && endDate) {
      const diffDays = calculateDiffDays(startDate, endDate);
      form.setValue("duration", diffDays);
    }
  });

  return () => {}; // 返回空的清理函数即可
}

// ❌ 不推荐写法 - 不需要手动管理订阅数组
watch: (form) => {
  const subscriptions = [
    form.watch(...),  // watch 返回值不是 unsubscribe 函数
  ];
  return () => subscriptions.forEach(unsubscribe => unsubscribe());
}
```

### 常见场景

1. 监听多个字段:
```typescript
watch: (form) => {
  form.watch(["field1", "field2"], ([value1, value2]) => {
    // 处理多个字段变化
    form.setValue("total", value1 + value2);
  });

  return () => {};
}
```

2. 条件显示控制:
```typescript
watch: (form) => {
  form.watch("type", (value) => {
    // 控制字段显示/隐藏
    form.setValue("extraField.hidden", value !== "special");
    
    // 可以同时设置其他属性
    if (value === "special") {
      form.setValue("extraField.required", true);
    }
  });

  return () => {};
}
```

3. 表格计算:
```typescript
watch: (form) => {
  form.watch("tableData", (tableData = []) => {
    // 计算每行金额
    tableData.forEach((row, index) => {
      const quantity = Number(row.quantity) || 0;
      const price = Number(row.price) || 0;
      
      form.setValue(`tableData.${index}.amount`, quantity * price);
    });

    // 计算总计
    const total = tableData.reduce((sum, row) => 
      sum + (Number(row.amount) || 0), 0
    );
    form.setValue("totalAmount", total);
  });

  return () => {};
}
```

### 特殊情况

在某些特殊场景下，可能需要手动管理 watch 的清理：

1. **在 useEffect 中使用 watch**
```typescript
useEffect(() => {
  const subscription = form.watch("fieldName", (value) => {
    // 处理值变化
  });
  
  // 在 useEffect 中返回清理函数
  return () => subscription.unsubscribe?.();
}, [form]);
```

2. **动态创建的 watch**
```typescript
// 如果需要在特定时机取消订阅
const unsubscribe = form.watch("fieldName", (value) => {
  // 处理值变化
});

// 可以在需要时调用取消订阅
unsubscribe();
```

### 工作原理

React Hook Form 的 watch 机制基于以下原理：

1. 使用 Subject 模式管理订阅
2. 在组件卸载时自动清理所有订阅
3. 与 React 组件生命周期集成

### 最佳实践

1. 避免在 watch 回调中执行可能导致无限循环的操作
2. 确保 watch 函数在组件挂载时只执行一次
3. 在特殊场景下考虑手动清理的必要性
4. 使用适当的依赖数组
5. 在大型表单中谨慎使用频繁的 watch

### 调试支持

```typescript
const debugWatch = createDebugWatch(form);
form.watch("fieldName", (value) => {
  console.log('Field changed:', value);
  // 处理值变化
});
```

### 性能优化

1. 使用防抖:
```typescript
const debouncedWatch = createDebouncedWatch(form);
debouncedWatch("searchInput", (value) => {
  // 处理搜索逻辑
}, 300);
```

2. 批量更新:
```typescript
form.batch(() => {
  form.setValue("field1", value1);
  form.setValue("field2", value2);
});
```

3. 精确监听:
```typescript
form.watch("specificField", (value) => {
  // 处理逻辑
}, {
  exact: true // 只监听精确的路径变化
});
```