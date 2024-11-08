## Watch 函数配置

watch 函数是处理表单动态逻辑的核心机制，它提供了一种统一的方式来处理字段依赖、条件显示和计算等动态行为。

### 基本用法

```typescript
// 1. 监听单个字段
const value = watch("fieldName");

// 2. 监听多个字段
const [value1, value2] = watch(["field1", "field2"]);

// 3. 监听整个表单
const formValues = watch();

// 4. 使用回调函数监听(推荐)
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    // 处理字段变化
    console.log(value, name, type);
  });
  
  // 重要: 需要在组件卸载时取消订阅
  return () => subscription.unsubscribe();
}, [watch]);
```

### 在动态表单中使用

1. 基本配置示例:

```typescript
const config: DynamicFormConfig = {
  // ... 其他配置
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'startDate' || name === 'endDate') {
        const { startDate, endDate } = form.getValues();
        if (startDate && endDate) {
          const diffDays = calculateDiffDays(startDate, endDate);
          form.setValue("duration", diffDays);
        }
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

2. 表格数据监听示例:

```typescript
useEffect(() => {
  const subscription = form.watch((value, { name }) => {
    if (name?.startsWith('tableData')) {
      // 处理表格数据变化
      const tableData = form.getValues('tableData');
      // ... 处理逻辑
    }
  });

  return () => subscription.unsubscribe();
}, [form]);
```

### 注意事项

1. 清理订阅
- 必须在 useEffect 的清理函数中调用 unsubscribe
- 对于配置中的 watch 函数，必须返回取消订阅函数

2. 性能优化
- 使用具体的字段名而不是监听整个表单
- 在回调函数中添加必要的判断
- 考虑使用 useWatch 替代 watch 来优化性能

3. 错误处理
- 添加适当的错误处理和日志
- 验证数据有效性

### 最佳实践

1. 使用回调函数形式:
```typescript
const subscription = watch((value, { name, type }) => {
  // 处理逻辑
});
```

2. 正确处理清理:
```typescript
useEffect(() => {
  const subscription = watch(...);
  return () => subscription.unsubscribe();
}, [watch]);
```

3. 精确监听字段:
```typescript
if (name === 'targetField') {
  // 处理特定字段
}
```

4. 添加错误处理:
```typescript
try {
  // 处理逻辑
} catch (error) {
  console.error('Watch error:', error);
}
```

### 常见问题

1. 订阅未清理导致的内存泄漏
2. 监听过多字段导致的性能问题
3. 缺少错误处理导致的异常
4. 重复设置值导致的死循环

### 调试技巧

1. 添加日志:
```typescript
const subscription = watch((value, { name, type }) => {
  console.log('Watch triggered:', { value, name, type });
  // ... 处理逻辑
});
```

2. 使用开发工具:
```typescript
if (process.env.NODE_ENV === 'development') {
  // 添加调试信息
}
```