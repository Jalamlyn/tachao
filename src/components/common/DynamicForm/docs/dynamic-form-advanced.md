# DynamicForm 高级使用指南

## 表单联动实现指南

### 1. 基本概念

在动态表单中,表单联动主要包含两个部分:

- 表单状态管理: 用于存储和更新表单的值
- 配置对象: 用于定义表单的结构和行为

### 2. 表单状态与配置对象

重要区别:

```mo
// 表单状态 - 可以动态修改
form.setValue("cityOptions", newOptions)

// 配置对象 - 不应该动态修改
form.setValue("renderConfig.basicFields.city.options", newOptions) // ❌ 错误
```

### 3. 动态选项的最佳实践

#### 3.1 定义选项字段

```mo
const config = {
  renderConfig: {
    basicFields: [
      {
        name: "city",
        type: "select",
        // ✅ 使用函数获取动态选项
        options: (form) => form.getValues("cityOptions") || [],
      },
    ],
  },
}
```

#### 3.2 实现联动逻辑

```mo
const config = {
  watch: (form) => {
    const subscription = form.watch((value, { name }) => {
      if (name === "province") {
        // 1. 清空依赖字段
        form.setValue("city", "")
        form.setValue("district", "")

        // 2. 获取新选项
        const cityOptions = getCityOptions(value.province)

        // 3. 更新选项到表单状态
        form.setValue("cityOptions", cityOptions)
      }
    })

    return () => subscription.unsubscribe()
  },
}
```

### 4. 完整示例: 省市区联动

```mo
export default {
  title: "地址选择",
  config: {
    metadata: {
      title: "地址选择",
      description: "省市区联动示例",
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
            { label: "北京市", value: "beijing" },
          ],
        },
        {
          name: "city",
          label: "城市",
          type: "select",
          required: true,
          // ✅ 使用函数获取动态选项
          options: (form) => form.getValues("cityOptions") || [],
        },
        {
          name: "district",
          label: "区县",
          type: "select",
          required: true,
          // ✅ 使用函数获取动态选项
          options: (form) => form.getValues("districtOptions") || [],
        },
      ],
    },
    watch: (form) => {
      const subscription = form.watch((value, { name }) => {
        if (name === "province") {
          const province = value.province

          // 获取城市选项
          const cityOptions =
            {
              guangdong: [
                { label: "广州市", value: "guangzhou" },
                { label: "深圳市", value: "shenzhen" },
              ],
              beijing: [{ label: "北京市区", value: "beijing_city" }],
            }[province] || []

          // 清空下级选项
          form.setValue("city", "")
          form.setValue("district", "")

          // 更新城市选项
          form.setValue("cityOptions", cityOptions)
        }

        if (name === "city") {
          const city = value.city

          // 获取区县选项
          const districtOptions =
            {
              guangzhou: [
                { label: "天河区", value: "tianhe" },
                { label: "越秀区", value: "yuexiu" },
              ],
              shenzhen: [
                { label: "南山区", value: "nanshan" },
                { label: "福田区", value: "futian" },
              ],
            }[city] || []

          // 清空已选值
          form.setValue("district", "")

          // 更新区县选项
          form.setValue("districtOptions", districtOptions)
        }
      })

      return () => subscription.unsubscribe()
    },
  },
}
```

### 5. 常见错误和解决方案

#### 5.1 选项不更新

❌ 错误写法:

```mo
// 试图直接修改配置对象
form.setValue("renderConfig.basicFields.city.options", cityOptions)
```

✅ 正确写法:

```mo
// 使用表单状态存储选项
form.setValue("cityOptions", cityOptions)
```

#### 5.2 状态更新但UI不刷新

❌ 错误写法:

```mo
options: cityOptions // 直接使用变量
```

✅ 正确写法:

```mo
options: (form) => form.getValues("cityOptions") || [] // 使用函数获取最新值
```

#### 5.3 忘记清空依赖字段

❌ 错误写法:

```mo
if (name === "province") {
  form.setValue("cityOptions", cityOptions)
  // 没有清空 city 和 district
}
```

✅ 正确写法:

```mo
if (name === "province") {
  // 先清空依赖字段
  form.setValue("city", "")
  form.setValue("district", "")
  // 再更新选项
  form.setValue("cityOptions", cityOptions)
}
```

### 6. 最佳实践总结

1. 使用表单状态存储动态数据
2. 使用函数获取动态选项
3. 记得清空依赖字段
4. 正确注销 watch 订阅
5. 提供合理的默认值

### 7. 调试技巧

1. 使用 console.log 查看表单值变化

```mo
watch: (form) => {
  const subscription = form.watch((value, { name }) => {
    console.log("Field changed:", name, value)
    console.log("Current form values:", form.getValues())
  })
  return () => subscription.unsubscribe()
}
```

2. 检查选项是否正确更新

```mo
options: (form) => {
  const opts = form.getValues("cityOptions") || []
  console.log("Current options:", opts)
  return opts
}
```

### 8. 性能优化

1. 避免不必要的状态更新

```mo
if (name === "province") {
  const newOptions = getCityOptions(value.province)
  // 只在选项真正变化时更新
  if (JSON.stringify(newOptions) !== JSON.stringify(form.getValues("cityOptions"))) {
    form.setValue("cityOptions", newOptions)
  }
}
```

2. 使用 debounce 处理频繁变化

```mo
import { debounce } from "lodash"

watch: (form) => {
  const handleChange = debounce((value, name) => {
    // 处理变化
  }, 300)

  const subscription = form.watch((value, { name }) => {
    handleChange(value, name)
  })

  return () => {
    subscription.unsubscribe()
    handleChange.cancel()
  }
}
```
