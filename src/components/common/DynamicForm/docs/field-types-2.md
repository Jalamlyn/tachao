#### 3.2 图片优化

```typescript
{
  name: "productImage",
  type: "upload",
  uploadConfig: {
    uploadType: "image",
    thumbnail: true,
    cropOptions: {
      quality: 0.8,      // 适当压缩
      width: 1200,       // 限制最大尺寸
      height: 1200
    },
    // 添加图片验证
    validators: [
      async (value) => {
        if (value) {
          const img = new Image()
          img.src = value
          await img.decode()
          if (img.width < 100 || img.height < 100) {
            return "图片尺寸太小，最小尺寸为 100x100"
          }
        }
        return undefined
      }
    ]
  }
}
```

### 4. 注意事项

1. 文件大小限制

- 设置合理的 maxSize 值
- 考虑服务器上传限制
- 添加适当的验证提示

2. 文件类型限制

- 使用 accept 属性限制文件类型
- 服务端也需要验证文件类型
- 考虑安全性问题

3. 多文件上传

- 合理设置 maxCount
- 考虑总上传大小限制
- 提供批量操作功能

4. 图片处理

- 合理设置压缩参数
- 考虑移动端性能
- 提供预览功能

### 5. 错误处理

```typescript
{
  name: "files",
  type: "upload",
  uploadConfig: {
    uploadType: "file",
    uploadConfig: {
      customRequest: async (options) => {
        try {
          // 上传处理
        } catch (error) {
          // 错误处理
          console.error("Upload error:", error)
          throw new Error("上传失败，请重试")
        }
      }
    },
    // 全局错误处理
    onError: (error) => {
      console.error("Upload error:", error)
      message.error("上传失败，请重试")
    }
  }
}
```

### 6. 性能优化

1. 图片优化

- 使用适当的压缩比例
- 限制图片最大尺寸
- 使用现代图片格式

2. 大文件处理

- 分片上传
- 断点续传
- 进度显示

3. 缓存处理

- 本地缓存预览
- 防重复上传
- 智能重试机制

## 字段配置详解

### 1. 基础字段配置

```typescript
interface BaseFieldConfig {
  name: string // 字段名称
  label: string // 字段标签
  type: FormFieldType // 字段类型
  required?: boolean // 是否必填
  disabled?: boolean // 是否禁用
  hidden?: boolean // 是否隐藏
  placeholder?: string // 占位文本
  className?: string // 样式类名
  style?: React.CSSProperties // 内联样式
}
```

### 2. 验证配置

```typescript
interface ValidationConfig {
  validators?: Array<(value: any, allValues?: any) => string | undefined>
  required?: boolean
  pattern?: RegExp
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  message?: string
}
```

### 3. 选项配置

```typescript
interface OptionConfig {
  options?:
    | Array<{
        label: string
        value: string | number
        disabled?: boolean
      }>
    | ((form: UseFormReturn<any>) => Array<{
        label: string
        value: string | number
        disabled?: boolean
      }>)
}
```
