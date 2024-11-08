## Watch 配置

watch 函数用于处理表单的动态逻辑，包括字段联动、条件显示和计算等。

```typescript
interface DynamicFormConfig {
  metadata: FormMetadata;
  renderConfig: FormRenderConfig;
  watch?: (form: UseFormReturn<any>) => (() => void);
}
```

示例：
```typescript
const config: DynamicFormConfig = {
  metadata: { ... },
  renderConfig: { ... },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      // 监听字段变化
      if (name === 'type') {
        form.setValue("extraField.hidden", value !== "special");
      }
      
      // 监听多个字段
      if (name === 'field1' || name === 'field2') {
        const { field1, field2 } = form.getValues();
        form.setValue("total", (field1 || 0) + (field2 || 0));
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }
};
```