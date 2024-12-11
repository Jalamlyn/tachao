# 动态表单字段类型配置说明

## 基础输入类型

### text - 单行文本输入
```typescript
{
  type: "text",
  name: "fieldName",
  label: "字段标签",
  placeholder: "请输入文本",
  required: true,
  disabled: false
}
```

### password - 密码输入
```typescript
{
  type: "password",
  name: "password",
  label: "密码",
  placeholder: "请输入密码"
}
```

### number - 数字输入
```typescript
{
  type: "number", 
  name: "amount",
  label: "金额",
  min: 0,
  max: 1000,
  step: 0.01
}
```

### email - 邮箱输入
```typescript
{
  type: "email",
  name: "email",
  label: "邮箱",
  placeholder: "请输入邮箱地址"
}
```

### tel - 电话号码
```typescript
{
  type: "tel",
  name: "phone",
  label: "电话",
  placeholder: "请输入电话号码"
}
```

### url - URL地址
```typescript
{
  type: "url",
  name: "website",
  label: "网址",
  placeholder: "请输入网址"
}
```

## 扩展输入类型

### textarea - 多行文本
```typescript
{
  type: "textarea",
  name: "description",
  label: "描述",
  placeholder: "请输入描述内容",
  rows: 4
}
```

### select - 下拉选择
```typescript
{
  type: "select",
  name: "category",
  label: "分类",
  options: [
    { label: "选项1", value: "1" },
    { label: "选项2", value: "2" }
  ],
  // 或者使用函数动态生成选项
  options: (form) => {
    return [
      { label: "选项1", value: "1" },
      { label: "选项2", value: "2" }
    ]
  }
}
```

### date - 日期选择
```typescript
{
  type: "date",
  name: "birthday",
  label: "生日",
  placeholder: "请选择日期"
}
```

### datetime - 日期时间选择
```typescript
{
  type: "datetime",
  name: "meetingTime",
  label: "会议时间",
  placeholder: "请选择日期和时间"
}
```