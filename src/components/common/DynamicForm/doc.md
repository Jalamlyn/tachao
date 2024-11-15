# DynamicForm 动态表单组件文档

[原有文档内容保持不变...]

## 表单联动配置指南

### 基础概念

表单联动是指表单字段之间的互动关系,比如:
- 字段值变化触发其他字段更新
- 动态更新选项数据
- 显示/隐藏字段

### Watch 函数使用

watch 函数用于监听字段变化并处理联动逻辑:

```typescript
const config = {
  watch: (form: UseFormReturn) => {
    // 创建订阅
    const subscription = form.watch((value, { name, type }) => {
      console.log('Field changed:', name, value);
      
      // 更新其他字段
      form.setValue('otherField', newValue);
    });

    // 返回清理函数
    return () => subscription.unsubscribe();
  }
}
```

### 动态更新选项

对于 Select 类型字段,可以动态更新选项:

```typescript
const config = {
  renderConfig: {
    basicFields: [
      {
        name: "city",
        type: "select",
        options: [] // 初始为空
      }
    ]
  },
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "province") {
        // 根据省份更新城市选项
        const cityOptions = getCityOptions(value.province);
        form.setValue("city", ""); // 清空已选值
        
        // 更新选项
        const cityField = form.getValues()?.basicFields?.find(f => f.name === "city");
        if (cityField) {
          form.setValue(`basicFields.${cityField.name}.options`, cityOptions);
        }
      }
    });
    return () => subscription.unsubscribe();
  }
}
```

### 省市区联动示例

完整的省市区联动配置示例:

```typescript
export default {
  title: "地址选择",
  config: {
    metadata: {
      title: "地址选择",
      description: "省市区联动示例"
    },
    renderConfig: {
      basicFields: [
        {
          name: "province",
          label: "省份",
          type: "select",
          required: true,
          options: [
            { label: "广东省", value: "guangdong" },
            { label: "北京市", value: "beijing" }
          ]
        },
        {
          name: "city",
          label: "城市",
          type: "select",
          required: true,
          options: []
        },
        {
          name: "district",
          label: "区县",
          type: "select",
          required: true,
          options: []
        }
      ]
    },
    watch: (form) => {
      const subscription = form.watch((value, { name }) => {
        if (name === "province") {
          const province = value.province;
          
          // 获取城市选项
          const cityOptions = {
            guangdong: [
              { label: "广州市", value: "guangzhou" },
              { label: "深圳市", value: "shenzhen" }
            ],
            beijing: [
              { label: "北京市区", value: "beijing_city" }
            ]
          }[province] || [];

          // 清空下级选项
          form.setValue("city", "");
          form.setValue("district", "");

          // 更新城市选项
          const cityField = form.getValues()?.basicFields?.find(f => f.name === "city");
          if (cityField) {
            form.setValue(`basicFields.${cityField.name}.options`, cityOptions);
          }
        }

        if (name === "city") {
          const city = value.city;
          
          // 获取区县选项
          const districtOptions = {
            guangzhou: [
              { label: "天河区", value: "tianhe" },
              { label: "越秀区", value: "yuexiu" }
            ],
            shenzhen: [
              { label: "南山区", value: "nanshan" },
              { label: "福田区", value: "futian" }
            ]
          }[city] || [];

          // 清空已选值
          form.setValue("district", "");

          // 更新区县选项
          const districtField = form.getValues()?.basicFields?.find(f => f.name === "district");
          if (districtField) {
            form.setValue(`basicFields.${districtField.name}.options`, districtOptions);
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }
}
```

### 最佳实践

1. Watch 函数注意事项:
- 始终返回清理函数
- 避免在 watch 中执行复杂计算
- 使用防抖处理频繁变化

2. 选项更新建议:
- 清空下级联动字段的值
- 使用 setValue 更新选项
- 保持选项数据结构一致

3. 性能优化:
- 使用 useMemo 缓存选项数据
- 避免不必要的状态更新
- 合理使用依赖收集

4. 错误处理:
- 添加必要的空值检查
- 处理异步加载失败情况
- 提供友好的错误提示

### 常见问题

1. 选项不更新
- 检查 watch 函数是否正确订阅
- 确认 setValue 路径正确
- 验证选项数据结构

2. 性能问题
- 使用 useCallback 优化函数
- 避免重复计算
- 考虑使用虚拟滚动

3. 内存泄漏
- 确保清理函数被调用
- 及时取消异步操作
- 清理定时器和事件监听

[原有文档其他内容保持不变...]