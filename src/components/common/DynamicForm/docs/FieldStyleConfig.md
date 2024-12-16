# 动态表单字段样式配置指南

本文档介绍如何使用 DynamicForm 组件的字段样式配置功能，通过样式配置可以实现更灵活的表单布局和展示效果。

## 配置选项

### 基础样式配置

可以通过 `style` 属性配置字段的基础样式：

```typescript
{
  name: "form.basic.fieldName",
  label: "字段标签",
  type: "text",
  // 布局配置应该在顶层，而不是在style中
  layout: "full-width", // 'default' | 'full-width' | 'inline'
  style: {
    // 尺寸
    width: "300px",  // 或 "100%"
    height: "40px",
    
    // 间距
    padding: "8px",
    margin: "4px",
    
    // 显示方式
    display: "block", // 'block' | 'inline-block' | 'flex'
    
    // 文本对齐
    textAlign: "left", // 'left' | 'center' | 'right'
    
    // 自定义样式
    custom: {
      backgroundColor: "#f5f5f5",
      borderRadius: "4px",
      // ... 其他 CSS 属性
    }
  }
}
```

### 布局配置

可以通过以下方式控制字段在表单中的布局：

```typescript
{
  name: "form.basic.fieldName",
  label: "字段标签",
  type: "text",
  // 方式1: 使用顶层 layout 属性
  layout: "full-width", // 'default' | 'full-width' | 'inline'
  
  // 方式2: 使用 style.colSpan
  style: {
    colSpan: 2 // 跨越的列数
  }
}
```

### 响应式配置

支持针对不同屏幕尺寸设置样式：

```typescript
{
  name: "form.basic.fieldName",
  label: "字段标签",
  type: "text",
  style: {
    // 默认样式
    width: "100%",
    padding: "8px",
    
    // 小屏幕样式 (sm)
    sm: {
      width: "100%",
      padding: "4px"
    },
    
    // 中等屏幕样式 (md)
    md: {
      width: "50%",
      padding: "8px"
    },
    
    // 大屏幕样式 (lg)
    lg: {
      width: "33.33%",
      padding: "12px"
    }
  }
}
```

## 使用示例

### 1. 基础示例

```typescript
const formConfig = {
  metadata: {
    title: "样式配置示例"
  },
  renderConfig: {
    basicFields: [
      {
        name: "form.basic.title",
        label: "标题",
        type: "text",
        layout: "full-width", // 布局配置应该在顶层
        style: {
          width: "100%",
          padding: "12px",
          custom: {
            backgroundColor: "#f5f5f5",
            borderRadius: "8px"
          }
        }
      },
      {
        name: "form.basic.description",
        label: "描述",
        type: "textarea",
        layout: "full-width",
        style: {
          height: "120px",
          padding: "12px"
        }
      }
    ]
  }
}
```

### 2. 响应式布局示例

```typescript
const formConfig = {
  metadata: {
    title: "响应式布局示例"
  },
  renderConfig: {
    basicFields: [
      {
        name: "form.basic.name",
        label: "姓名",
        type: "text",
        style: {
          sm: { colSpan: 2 },
          md: { colSpan: 1 }
        }
      },
      {
        name: "form.basic.email",
        label: "邮箱",
        type: "email",
        style: {
          sm: { colSpan: 2 },
          md: { colSpan: 1 }
        }
      },
      {
        name: "form.basic.address",
        label: "地址",
        type: "textarea",
        layout: "full-width", // 使用顶层layout属性
        style: {
          height: "80px"
        }
      }
    ]
  }
}
```

### 3. 复杂布局示例

```typescript
const formConfig = {
  metadata: {
    title: "复杂布局示例"
  },
  renderConfig: {
    basicFields: [
      {
        name: "form.basic.header",
        label: "表单标题",
        type: "text",
        layout: "full-width",
        style: {
          custom: {
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "24px"
          }
        }
      },
      {
        name: "form.basic.leftColumn",
        label: "左侧内容",
        type: "textarea",
        style: {
          sm: { colSpan: 2 },
          md: { colSpan: 1 },
          height: "200px",
          custom: {
            backgroundColor: "#f0f7ff"
          }
        }
      },
      {
        name: "form.basic.rightColumn",
        label: "右侧内容",
        type: "textarea",
        style: {
          sm: { colSpan: 2 },
          md: { colSpan: 1 },
          height: "200px",
          custom: {
            backgroundColor:"#fff0f6"
          }
        }
      },
      {
        name: "form.basic.footer",
        label: "底部内容",
        type: "text",
        layout: "full-width",
        style: {
          padding: "16px",
          custom: {
            backgroundColor: "#f6ffed",
            textAlign: "center"
          }
        }
      }
    ]
  }
}
```

## 最佳实践

1. 样式分类管理
```typescript
// 创建样式预设
const stylePresets = {
  fullWidth: {
    layout: "full-width" // 布局配置应该在顶层
  },
  halfWidth: {
    style: {
      sm: { colSpan: 2 },
      md: { colSpan: 1 }
    }
  },
  card: {
    style: {
      padding: "16px",
      custom: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }
    }
  }
}

// 使用预设
const field = {
  ...stylePresets.halfWidth,
  name: "form.basic.fieldName",
  label: "字段标签",
  type: "text"
}
```