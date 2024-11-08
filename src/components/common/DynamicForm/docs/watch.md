## Watch 函数配置

watch 函数是处理表单动态逻辑的核心机制，提供了统一的方式来处理字段依赖、条件显示和计算等动态行为。

### 基本用法

```typescript
const config: DynamicFormConfig = {
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 通过 name 判断是哪个字段发生变化
      switch(name) {
        case 'startDate':
        case 'endDate':
          const { startDate, endDate } = form.getValues();
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            form.setValue("duration", diffDays);
          }
          break;
          
        case 'type':
          const { type } = form.getValues();
          form.setValue('extraField.hidden', type !== 'special');
          break;
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

### 高级功能

1. 批量更新
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'template') {
      // 批量更新多个字段
      form.batch(() => {
        form.setValue('field1', value.field1);
        form.setValue('field2', value.field2);
        form.setValue('field3', value.field3);
      });
    }
  });
  
  return () => subscription.unsubscribe();
}
```

2. 条件显示
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'type') {
      const type = form.getValues('type');
      // 控制多个字段的显示/隐藏
      ['field1', 'field2', 'field3'].forEach(field => {
        form.setValue(`${field}.hidden`, type !== 'advanced');
      });
    }
  });
  
  return () => subscription.unsubscribe();
}
```

3. 联动计算
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    if (name.startsWith('tableData')) {
      const tableData = form.getValues('tableData') || [];
      // 计算表格汇总数据
      const total = tableData.reduce((sum, row) => {
        return sum + (Number(row.amount) || 0);
      }, 0);
      form.setValue('totalAmount', total);
    }
  });
  
  return () => subscription.unsubscribe();
}
```

### 注意事项

1. 性能优化
```typescript
// 使用防抖处理频繁变化
import { debounce } from 'lodash';

watch: (form) => {
  const handleChange = debounce((name: string) => {
    // 处理逻辑
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

2. 错误处理
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    try {
      // 处理逻辑
    } catch (error) {
      console.error(`Watch error for field ${name}:`, error);
      // 可以显示错误提示
      message.error(`字段 ${name} 更新失败`);
    }
  });

  return () => subscription.unsubscribe();
}
```

3. 清理订阅
```typescript
watch: (form) => {
  const subscriptions = [
    form.watch('field1', handleField1Change),
    form.watch('field2', handleField2Change),
    form.watch('field3', handleField3Change)
  ];

  return () => {
    subscriptions.forEach(subscription => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    });
  };
}
```

### 最佳实践

1. 组织 watch 逻辑
```typescript
// 将相关的 watch 逻辑组织在一起
watch: (form) => {
  // 1. 基础字段联动
  const basicFieldsSubscription = watchBasicFields(form);
  
  // 2. 表格数据处理
  const tableSubscription = watchTableData(form);
  
  // 3. 流程状态处理
  const processSubscription = watchProcessStatus(form);

  return () => {
    basicFieldsSubscription.unsubscribe();
    tableSubscription.unsubscribe();
    processSubscription.unsubscribe();
  };
}
```

2. 使用工具函数
```typescript
// 创建通用的 watch 工具
const createFieldWatch = (form: UseFormReturn<any>) => ({
  // 监听单个字段
  watchField: (name: string, callback: (value: any) => void) => {
    return form.watch(name, callback);
  },

  // 监听多个字段
  watchFields: (names: string[], callback: (values: any[]) => void) => {
    return form.watch(names, callback);
  },

  // 批量更新
  batchUpdate: (updates: Array<{ field: string; value: any }>) => {
    form.batch(() => {
      updates.forEach(({ field, value }) => {
        form.setValue(field, value);
      });
    });
  }
});
```

3. 调试技巧
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name, type }) => {
    // 添加调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('Watch triggered:', {
        field: name,
        type,
        value,
        allValues: form.getValues()
      });
    }
    
    // 处理逻辑
  });

  return () => subscription.unsubscribe();
}
```

### 常见问题

1. 如何处理循环依赖?
```typescript
// 使用标记避免循环
let isUpdating = false;

watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    if (isUpdating) return;
    
    isUpdating = true;
    try {
      // 处理逻辑
    } finally {
      isUpdating = false;
    }
  });

  return () => subscription.unsubscribe();
}
```

2. 如何处理异步操作?
```typescript
watch: (form) => {
  const subscription = form.watch(async (value, { name }) => {
    if (name === 'userId') {
      try {
        const userInfo = await fetchUserInfo(value);
        form.setValue('userInfo', userInfo);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    }
  });

  return () => subscription.unsubscribe();
}
```

3. 如何优化性能?
```typescript
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    // 只处理关心的字段
    if (!['price', 'quantity', 'type'].includes(name)) {
      return;
    }
    
    // 处理逻辑
  });

  return () => subscription.unsubscribe();
}
```