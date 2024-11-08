## Watch 函数配置

watch 函数是处理表单动态逻辑的核心机制，它提供了一种统一的方式来处理字段依赖、条件显示和计算等动态行为。

### 基本用法

推荐使用单个 watch 监听所有字段变化的方式:

```typescript
const config: DynamicFormConfig = {
  // ... 其他配置
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 通过 name 判断是哪个字段发生变化
      if (name === 'startDate' || name === 'endDate') {
        const { startDate, endDate } = form.getValues();
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          form.setValue("duration", diffDays);
        }
      }
    });

    // 返回清理函数
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }
};
```

### 最佳实践

1. 使用单个 watch:
```typescript
// ✅ 推荐: 使用单个 watch 监听所有字段
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    switch(name) {
      case 'price':
      case 'quantity':
        const { price, quantity } = form.getValues();
        form.setValue('amount', (price || 0) * (quantity || 0));
        break;
      case 'type':
        const { type } = form.getValues();
        form.setValue('extraField.hidden', type !== 'special');
        break;
    }
  });

  return () => subscription.unsubscribe();
}

// ❌ 不推荐: 使用多个 watch
watch: (form) => {
  const subscription1 = form.watch('price', () => {/*...*/});
  const subscription2 = form.watch('quantity', () => {/*...*/});
  return () => {
    subscription1.unsubscribe();
    subscription2.unsubscribe();
  }
}
```

2. 正确处理清理函数:
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    // 处理逻辑
  });

  return () => {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  };
}
```

3. 添加错误处理:
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    try {
      // 处理逻辑
    } catch (error) {
      console.error(`Watch error for field ${name}:`, error);
    }
  });

  return () => subscription.unsubscribe();
}
```

4. 使用 TypeScript 类型:
```typescript
watch: (form: UseFormReturn<any>) => {
  const subscription = form.watch((
    value: any, 
    { name, type }: { name: string; type: string }
  ) => {
    // 处理逻辑
  });

  return () => subscription.unsubscribe();
}
```

### 注意事项

1. 避免在 watch 回调中进行复杂计算
2. 考虑使用防抖处理频繁变化
3. 不要在 watch 中直接修改其他组件的状态
4. 确保正确处理清理函数
5. 添加适当的错误处理

### 调试技巧

1. 添加日志:
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name, type }) => {
    console.log('Watch triggered:', { field: name, type, value });
    // ... 处理逻辑
  });

  return () => subscription.unsubscribe();
}
```

2. 使用开发工具:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Form values:', form.getValues());
}
```

### 常见问题

1. 订阅未清理导致的内存泄漏
2. 监听过多字段导致的性能问题
3. 缺少错误处理导致的异常
4. 重复设置值导致的死循环

### 性能优化

1. 使用条件判断避免不必要的计算:
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    // 只处理关心的字段
    if (!['price', 'quantity', 'type'].includes(name)) {
      return;
    }
    // ... 处理逻辑
  });

  return () => subscription.unsubscribe();
}
```

2. 使用防抖处理频繁变化:
```typescript
import { debounce } from 'lodash';

watch: (form) => {
  const handleChange = debounce((name: string) => {
    // ... 处理逻辑
  }, 300);

  const subscription = form.watch((value, { name }) => {
    handleChange(name);
  });

  return () => {
    subscription.unsubscribe();
    handleChange.cancel();
  };
}
```