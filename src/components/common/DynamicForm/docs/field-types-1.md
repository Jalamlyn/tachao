# DynamicForm 字段类型系统文档

本文档采用结构化格式，专门针对AI模型理解和处理DynamicForm的字段类型系统。

## 字段类型分类

### 1. 基础输入类型

```typescript
type BasicInputType =
  | "text" // 文本输入
  | "password" // 密码输入
  | "number" // 数字输入
  | "email" // 邮箱输入
  | "tel" // 电话输入
  | "url" // URL输入
```

特点：

- 简单直接的数据输入
- 内置基本验证
- 支持placeholder
- 支持禁用状态

### 2. 扩展输入类型

```typescript
type ExtendedInputType =
  | "textarea" // 多行文本
  | "select" // 下拉选择
  | "date" // 日期选择
  | "datetime" // 日期时间选择
```

特点：

- 复杂数据输入
- 自定义验证规则
- 支持格式化
- 支持自定义渲染

### 3. 特殊输入类型

```typescript
type SpecialInputType =
  | "file" // 文件上传（已废弃，请使用 upload 类型）
  | "image" // 图片上传（已废弃，请使用 upload 类型）
  | "upload" // 统一的上传组件（支持文件、图片、视频等）
  | "signature" // 签名
  | "custom" // 自定义组件
```

特点：

- 特定场景使用
- 复杂交互逻辑
- 自定义渲染
- 特殊数据处理

### 4. 选择类型

```typescript
type SelectionType =
  | "radio" // 单选框
  | "checkbox" // 复选框
  | "switch" // 开关
  | "slider" // 滑块
```

特点：

- 选择性输入
- 支持选项配置
- 支持布局设置
- 支持禁用选项

### 5. 资源类型

```typescript
type ResourceType = "resource" // 资源选择
```

特点：

- 主数据选择
- 支持手动输入
- 复杂数据结构
- 自定义渲染

## 资源字段（Resource）最佳实践

### 1. 基本配置示例

```typescript
// 1. 基础资源字段配置
{
  name: "supplier",
  label: "供应商",
  type: "resource",
  required: true,
  resourceConfig: {
    resourceId: "resource_xxxx",
    multiple: false,  // 单选模式
    // 显示字段配置
    displayField: "name", // 主显示字段
    // 或使用显示格式化
    displayFormat: (resource) => `${resource.code} - ${resource.name}`,
    // 触发器配置
    triggerConfig: {
      type: "button", // 或 "icon"
      text: "选择供应商",
      icon: "mdi:search",
      className: "custom-trigger"
    },
    displayFields: [
      {
        key: "code",
        label: "供应商编号"
      },
      {
        key: "name",
        label: "供应商名称",
        render: (value) => `${value}` // 自定义渲染函数
      }
    ]
  }
}

// 2. 表格中的资源字段配置
{
  key: "product",
  title: "产品",
  type: "resource",
  resourceConfig: {
    resourceId: "resource_xxx",
    displayField: "name",
    showTrigger: true, // 显示触发按钮
    triggerPosition: "right", // 触发按钮位置
    inlineDisplay: true, // 内联显示选择界面
    // 字段映射配置
    fieldMapping: {
      "productCode": "code",
      "productName": "name",
      // 复杂映射
      "fullSpec": {
        fields: ["spec", "model"],
        transform: (values) => values.join(" - ")
      }
    }
  }
}

// 3. 多选模式配置
{
  name: "materials",
  label: "原材料",
  type: "resource",
  resourceConfig: {
    resourceId: "resource_xxx",
    multiple: true,
    displayFormat: (resources) => 
      resources.map(r => r.name).join(", "),
    triggerConfig: {
      type: "button",
      text: "选择材料",
      icon: "mdi:plus"
    }
  }
}
```

### 2. 使用场景区分

1. 基本信息区域：
   - 使用单选资源字段
   - 配置displayField或displayFormat
   - 使用triggerConfig自定义触发器

2. 表格中使用：
   - 配置showTrigger和triggerPosition
   - 使用inlineDisplay优化交互
   - 配置fieldMapping实现数据映射

### 3. 最佳实践建议

1. 显示优化：
   - 使用displayField指定主显示字段
   - 使用displayFormat自定义显示格式
   - 配置合适的触发器样式

2. 交互优化：
   - 合理使用triggerConfig
   - 表格中使用showTrigger
   - 考虑inlineDisplay提升体验

3. 数据处理：
   - 使用fieldMapping映射数据
   - 处理多选数据格式化
   - 缓存已选择的数据

4. 性能优化：
   - 使用缓存机制
   - 按需加载数据
   - 优化渲染性能