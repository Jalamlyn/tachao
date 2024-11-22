# DynamicForm 动态表单组件文档

## 简介

DynamicForm 是一个灵活的动态表单组件，支持以下功能：

- 基础表单字段渲染
- 动态表格
- 流程确认步骤
- 打印预览
- 自定义验证
- 动态联动
- AI 生成的公式计算（新功能）
- 手写签名（新功能）

## 基础类型

### FormFieldType

表单字段类型枚举：

```typescript
type FormFieldType =
  | "text" // 文本输入
  | "password" // 密码输入
  | "number" // 数字输入
  | "email" // 邮箱输入
  | "tel" // 电话输入
  | "url" // URL输入
  | "textarea" // 多行文本
  | "select" // 下拉选择
  | "date" // 日期选择
  | "datetime" // 日期时间选择
  | "file" // 文件上传
  | "image" // 图片上传
  | "custom" // 自定义组件
  | "resource" // 资源选择
  | "signature" // 手写签名
```

### FormField

表单字段配置接口：

```typescript
interface FormField {
  name: string // 字段名称
  label: string // 字段标签
  type: FormFieldType // 字段类型
  placeholder?: string // 占位文本
  disabled?: boolean // 是否禁用
  hidden?: boolean // 是否隐藏
  required?: boolean // 是否必填
  tooltip?: TooltipConfig // 提示配置
  validators?: Array<(value: any, allValues?: any) => string | undefined> // 自定义验证器
  options?: Array<{
    // 选项配置（用于select类型）
    label: string
    value: string | number
    disabled?: boolean
  }>
  accept?: string // 文件接受类型
  resourceConfig?: {
    // 资源选择配置
    resourceName: string
    appId: string
    selectionMode?: "single" | "multiple"
  }
  onUpload?: (file: File) => Promise<void> // 上传处理函数
  render?: (props: {
    // 自定义渲染函数
    field: any
    form: UseFormReturn<any>
    isEditable: boolean
  }) => ReactNode
  width?: number | string // 签名组件宽度
  height?: number // 签名组件高度
  lineWidth?: number // 签名笔画宽度
  lineColor?: string // 签名笔画颜色
  className?: string // 自定义类名
}
```

### 自定渲染示例：

```jsx
...
{
  name: "mapLocation",
  label: "地图选择",
  type: "custom",
  render: ({ field, isEditable }) => {
    return(
      <div>
        <Button
          variant="outline"
          disabled={!isEditable}
          onClick={() => {
            // 打开地图选择弹窗逻辑
            console.log('打开地图选择')
          }}
        >
          选择地址
        </Button>
      </div>
    )
  }
}
...
```

### 手写签名组件

动态表单支持手写签名字段,使用示例:

```typescript
{
  name: "signature",
  label: "签名",
  type: "signature",
  required: true,
  width: '100%', // 可选,默认 100%
  height: 200, // 可选,默认 200
  lineWidth: 2, // 可选,默认 2
  lineColor: "#000000", // 可选,默认黑色
  className: "max-w-[500px]" // 可选,限制最大宽度
}
```

签名组件支持以下功能:
- 鼠标和触摸屏输入
- 清除重写
- 禁用状态
- 返回签名图片的 base64 数据
- 支持设置画布大小和画笔样式
- 移动端自适应
- 高清显示支持

在流程确认中使用示例:
```typescript
const config = {
  renderConfig: {
    processSteps: [
      {
        key: "sign",
        title: "签字确认",
        fields: [
          {
            name: "signature",
            label: "签名",
            type: "signature",
            required: true,
            width: '100%',
            height: 200,
            className: "max-w-[500px]"
          }
        ]
      }
    ]
  }
}
```

[其余文档内容保持不变...]