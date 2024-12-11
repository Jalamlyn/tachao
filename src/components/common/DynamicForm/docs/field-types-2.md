## 特殊输入类型

### upload - 文件上传
```typescript
{
  type: "upload",
  name: "files",
  label: "文件上传",
  uploadConfig: {
    uploadType: "file", // file | image | video | audio
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    maxCount: 5,
    thumbnail: true, // 仅图片类型有效
    cropOptions: { // 仅图片类型有效
      aspect: 16/9,
      quality: 0.8
    },
    onSuccess: (fileInfo) => console.log(fileInfo),
    onError: (error) => console.error(error),
    onProgress: (percent) => console.log(percent)
  }
}
```

### signature - 手写签名
```typescript
{
  type: "signature",
  name: "signature",
  label: "签名",
  width: 300,
  height: 200,
  lineWidth: 2,
  lineColor: "#000000"
}
```

### resource - 资源选择器
```typescript
{
  type: "resource",
  name: "product",
  label: "产品",
  resourceConfig: {
    resourceId: "products",
    multiple: false,
    displayField: "name",
    displayFields: [
      { key: "code", label: "编号" },
      { key: "name", label: "名称" },
      { key: "price", label: "价格" }
    ],
    fieldMapping: {
      "price": "price",
      "description": {
        field: "desc",
        transform: (value) => `产品描述: ${value}`
      }
    }
  }
}
```

## 选择类型

### radio - 单选框组
```typescript
{
  type: "radio",
  name: "gender",
  label: "性别",
  layout: "horizontal", // horizontal | vertical
  options: [
    { label: "男", value: "male" },
    { label: "女", value: "female" }
  ]
}
```

### checkbox - 复选框组
```typescript
{
  type: "checkbox",
  name: "hobbies",
  label: "兴趣爱好",
  layout: "vertical",
  options: [
    { label: "阅读", value: "reading" },
    { label: "运动", value: "sports" }
  ]
}
```

### switch - 开关
```typescript
{
  type: "switch",
  name: "status",
  label: "状态",
  checkedLabel: "启用",
  uncheckedLabel: "禁用"
}
```

### slider - 滑块
```typescript
{
  type: "slider",
  name: "progress",
  label: "进度",
  min: 0,
  max: 100,
  step: 1
}
```

## 自定义组件

### custom - 自定义渲染
```typescript
{
  type: "custom",
  name: "custom",
  label: "自定义组件",
  render: ({ field, form, isEditable }) => {
    return <YourCustomComponent {...field} disabled={!isEditable} />
  }
}
```

## 通用配置项

所有字段类型都支持以下通用配置:

```typescript
{
  name: string;           // 字段名称(必填)
  label: string;          // 字段标签(必填)
  type: FormFieldType;    // 字段类型(必填)
  placeholder?: string;   // 占位文本
  disabled?: boolean;     // 是否禁用
  hidden?: boolean;       // 是否隐藏
  required?: boolean;     // 是否必填
  className?: string;     // 自定义类名
  style?: CSSProperties; // 自定义样式
  tooltip?: {            // 提示信息
    content: ReactNode;
    placement?: "top" | "bottom" | "left" | "right";
  }
  validators?: Array<(value: any, allValues?: any) => string | undefined>; // 自定义校验
}
```