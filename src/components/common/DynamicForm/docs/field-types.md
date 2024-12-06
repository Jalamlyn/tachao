# DynamicForm 字段类型文档

## 支持的字段类型

DynamicForm 支持丰富的字段类型，以满足各种表单场景需求。

### 基础输入类型
- `text` - 文本输入框
- `password` - 密码输入框
- `number` - 数字输入框
- `email` - 邮箱输入框
- `tel` - 电话号码输入框
- `url` - URL 输入框
- `textarea` - 多行文本输入框

### 选择类型
- `select` - 下拉选择框
- `radio` - 单选框组
- `checkbox` - 复选框组
- `switch` - 开关
- `slider` - 滑块
- `date` - 日期选择器
- `datetime` - 日期时间选择器

### 文件类型
- `file` - 文件上传
- `image` - 图片上传

### 特殊类型
- `resource` - 资源选择字段
- `signature` - 签名字段
- `custom` - 自定义字段

## 字段配置示例

### 基础文本输入框
```typescript
{
  name: "title",
  label: "标题",
  type: "text",
  required: true,
  placeholder: "请输入标题"
}
```

### 单选框组
```typescript
{
  name: "gender",
  label: "性别",
  type: "radio",
  options: [
    { label: "男", value: "male" },
    { label: "女", value: "female" }
  ],
  layout: "horizontal"  // 或 "vertical"
}
```

### 复选框组
```typescript
{
  name: "hobbies",
  label: "兴趣爱好",
  type: "checkbox",
  options: [
    { label: "阅读", value: "reading" },
    { label: "音乐", value: "music" },
    { label: "运动", value: "sports" }
  ],
  layout: "vertical"
}
```

### 开关
```typescript
{
  name: "status",
  label: "状态",
  type: "switch",
  checkedLabel: "启用",
  uncheckedLabel: "禁用"
}
```

### 滑块
```typescript
{
  name: "progress",
  label: "进度",
  type: "slider",
  min: 0,
  max: 100,
  step: 1
}
```

### 资源选择字段
```typescript
{
  name: "supplier",
  label: "供应商",
  type: "resource",
  required: true,
  resourceConfig: {
    resourceTitle: "供应商主数据",
    // 新增：允许手动输入配置
    allowManualInput: true,
    manualInputFields: [
      { 
        key: "name", 
        label: "名称", 
        type: "text",
        required: true 
      },
      { 
        key: "code", 
        label: "编号", 
        type: "text" 
      },
      { 
        key: "contact", 
        label: "联系人" 
      },
      { 
        key: "phone", 
        label: "电话", 
        type: "tel" 
      }
    ]
  }
}
```

## 通用字段属性

所有字段类型都支持以下通用属性：

| 属性名 | 类型 | 说明 |
|--------|------|------|
| name | string | 字段名称（必填） |
| label | string | 字段标签（必填） |
| type | string | 字段类型（必填） |
| required | boolean | 是否必填 |
| disabled | boolean | 是否禁用 |
| hidden | boolean | 是否隐藏 |
| placeholder | string | 占位文本 |
| tooltip | TooltipConfig | 提示信息配置 |
| validators | function[] | 自定义验证器 |

## 特定字段类型的额外属性

### Radio/Checkbox
| 属性名 | 类型 | 说明 |
|--------|------|------|
| options | Array | 选项配置数组 |
| layout | "horizontal" \| "vertical" | 布局方向 |

### Switch
| 属性名 | 类型 | 说明 |
|--------|------|------|
| checkedLabel | string | 选中时的文本 |
| uncheckedLabel | string | 未选中时的文本 |

### Slider
| 属性名 | 类型 | 说明 |
|--------|------|------|
| min | number | 最小值 |
| max | number | 最大值 |
| step | number | 步长 |

### Resource
| 属性名 | 类型 | 说明 |
|--------|------|------|
| resourceTitle | string | 资源标题（必填） |
| allowManualInput | boolean | 是否允许手动输入 |
| manualInputFields | Array | 手动输入字段配置 |

#### ManualInputField 配置
| 属性名 | 类型 | 说明 |
|--------|------|------|
| key | string | 字段键名（必填） |
| label | string | 字段标签（必填） |
| type | "text" \| "number" \| "email" \| "tel" | 输入类型 |
| required | boolean | 是否必填 |

## 最佳实践

1. 字段命名
   - 使用有意义的名称
   - 遵循驼峰命名规则
   - 避免特殊字符

2. 验证规则
   - 合理使用必填验证
   - 添加适当的自定义验证
   - 提供清晰的错误提示

3. 用户体验
   - 添加合适的占位文本
   - 使用 tooltip 提供帮助信息
   - 保持表单布局的一致性

4. 资源字段使用建议
   - 优先使用资源选择模式
   - 在无可选数据时启用手动输入
   - 合理配置必填字段
   - 提供清晰的字段说明

5. 新增控件使用建议
   - Radio：适用于单选且选项较少的场景
   - Checkbox：适用于多选场景
   - Switch：适用于开关切换场景
   - Slider：适用于数值范围选择场景
   - Resource：适用于主数据选择场景，支持手动输入作为备选方案