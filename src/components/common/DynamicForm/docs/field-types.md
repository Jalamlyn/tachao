# DynamicForm 字段类型系统文档

本文档采用结构化格式，专门针对AI模型理解和处理DynamicForm的字段类型系统。

## 字段类型分类

### 1. 基础输入类型
```typescript
type BasicInputType = 
  | "text"      // 文本输入
  | "password"  // 密码输入
  | "number"    // 数字输入
  | "email"     // 邮箱输入
  | "tel"       // 电话输入
  | "url"       // URL输入
```

特点：
- 简单直接的数据输入
- 内置基本验证
- 支持placeholder
- 支持禁用状态

### 2. 扩展输入类型
```typescript
type ExtendedInputType =
  | "textarea"  // 多行文本
  | "select"    // 下拉选择
  | "date"      // 日期选择
  | "datetime"  // 日期时间选择
```

特点：
- 复杂数据输入
- 自定义验证规则
- 支持格式化
- 支持自定义渲染

### 3. 特殊输入类型
```typescript
type SpecialInputType =
  | "file"      // 文件上传（已废弃，请使用 upload 类型）
  | "image"     // 图片上传（已废弃，请使用 upload 类型）
  | "upload"    // 统一的上传组件（支持文件、图片、视频等）
  | "signature" // 签名
  | "custom"    // 自定义组件
```

特点：
- 特定场景使用
- 复杂交互逻辑
- 自定义渲染
- 特殊数据处理

### 4. 选择类型
```typescript
type SelectionType =
  | "radio"     // 单选框
  | "checkbox"  // 复选框
  | "switch"    // 开关
  | "slider"    // 滑块
```

特点：
- 选择性输入
- 支持选项配置
- 支持布局设置
- 支持禁用选项

### 5. 资源类型
```typescript
type ResourceType = "resource"  // 资源选择
```

特点：
- 主数据选择
- 支持手动输入
- 复杂数据结构
- 自定义渲染

## 统一上传字段（Upload）详细说明

### 1. 配置接口
```typescript
interface UploadFieldConfig {
  type: "upload"
  uploadConfig: {
    // 上传类型
    uploadType: "file" | "image" | "video" | "audio"
    
    // 基础配置
    multiple?: boolean       // 是否支持多文件
    maxSize?: number        // 最大文件大小（字节）
    maxCount?: number       // 最大文件数量
    accept?: string         // 接受的文件类型
    
    // 图片专用配置
    thumbnail?: boolean     // 是否显示缩略图
    cropOptions?: {
      aspect?: number       // 裁剪比例
      quality?: number      // 压缩质量
      width?: number        // 目标宽度
      height?: number       // 目标高度
    }
    
    // 高级配置
    uploadConfig?: {
      action?: string       // 自定义上传地址
      headers?: Record<string, string>  // 自定义请求头
      withCredentials?: boolean         // 是否携带凭证
      customRequest?: (options: any) => Promise<any>  // 自定义上传实现
    }
  }
}
```

### 2. 使用示例

#### 2.1 基础文件上传
```typescript
{
  name: "documents",
  label: "文档上传",
  type: "upload",
  uploadConfig: {
    uploadType: "file",
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxCount: 5,
    accept: ".pdf,.doc,.docx"
  }
}
```

#### 2.2 图片上传
```typescript
{
  name: "avatar",
  label: "头像上传",
  type: "upload",
  uploadConfig: {
    uploadType: "image",
    thumbnail: true,
    cropOptions: {
      aspect: 1,
      quality: 0.8,
      width: 200,
      height: 200
    },
    accept: "image/*"
  }
}
```

#### 2.3 带自定义处理的上传
```typescript
{
  name: "files",
  label: "自定义上传",
  type: "upload",
  uploadConfig: {
    uploadType: "file",
    uploadConfig: {
      customRequest: async (options) => {
        const { file, onProgress, onSuccess, onError } = options
        try {
          // 自定义上传逻辑
          onProgress({ percent: 50 })
          const result = await customUploadFunction(file)
          onSuccess(result)
          return result
        } catch (error) {
          onError(error)
        }
      }
    }
  }
}
```

### 3. 最佳实践

#### 3.1 文件大小限制
```typescript
{
  name: "attachment",
  type: "upload",
  uploadConfig: {
    uploadType: "file",
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: ".pdf,.doc,.docx",
    // 添加验证器
    validators: [
      (value) => {
        if (value && value.size > 5 * 1024 * 1024) {
          return "文件大小不能超过5MB"
        }
        return undefined
      }
    ]
  }
}
```

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
  name: string           // 字段名称
  label: string         // 字段标签
  type: FormFieldType   // 字段类型
  required?: boolean    // 是否必填
  disabled?: boolean    // 是否禁用
  hidden?: boolean      // 是否隐藏
  placeholder?: string  // 占位文本
  className?: string    // 样式类名
  style?: React.CSSProperties  // 内联样式
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
  options?: Array<{
    label: string
    value: string | number
    disabled?: boolean
  }> | ((form: UseFormReturn<any>) => Array<{
    label: string
    value: string | number
    disabled?: boolean
  }>)
}
```

### 4. 资源字段配置
```typescript
interface ResourceFieldConfig {
  resourceConfig: {
    resourceTitle: string
    allowManualInput?: boolean
    manualInputFields?: Array<{
      key: string
      label: string
      type?: ManualInputFieldType
      required?: boolean
      options?: Array<{
        label: string
        value: string | number
      }>
    }>
  }
}
```

## 最佳实践

1. 类型选择
- 根据数据特点选择合适的字段类型
- 考虑用户输入便利性
- 注意移动端兼容性

2. 验证配置
- 合理使用必填验证
- 添加适当的格式验证
- 提供清晰的错误提示

3. 样式配置
- 保持样式一致性
- 注意响应式布局
- 适当使用主题变量

4. 性能优化
- 避免过度验证
- 合理使用缓存
- 优化联动逻辑

本文档针对AI模型优化，提供了结构化的字段类型系统说明和示例。每种字段类型都有完整的配置说明和使用示例，便于AI理解和生成正确的字段配置代码。