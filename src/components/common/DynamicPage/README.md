# DynamicPage

动态页面生成系统，支持 AI 驱动的页面生成、灵活的布局系统和组件管理。

## 特性

- 🎨 灵活的布局系统
  - Grid 布局
  - Flex 布局
  - Flow 布局
  - 响应式支持

- 🤖 AI 驱动的页面生成
  - 自然语言描述
  - 智能布局推荐
  - 组件自动配置

- 📦 组件管理系统
  - 组件注册中心
  - 异步加载支持
  - 元数据管理

- 🛠 开发工具
  - TypeScript 支持
  - 错误边界处理
  - 性能优化

## 快速开始

### 基础使用

```tsx
import { PageRenderer, useComponents } from '@/components/common/DynamicPage'

const config = {
  metadata: {
    title: "示例页面"
  },
  layout: {
    type: "grid",
    grid: {
      cols: { base: 1, md: 2 }
    }
  },
  content: [
    {
      type: "Card",
      props: {
        children: "内容"
      }
    }
  ]
}

const MyPage = () => {
  const { components } = useComponents()
  return <PageRenderer config={config} components={components} />
}
```

### AI 生成页面

```tsx
import { usePageGenerator } from '@/components/common/DynamicPage'

const AIPage = () => {
  const { generatePage, config } = usePageGenerator()
  
  const handleGenerate = () => {
    generatePage("创建一个客户管理页面")
  }
  
  return (
    <button onClick={handleGenerate}>生成页面</button>
  )
}
```

### 注册自定义组件

```tsx
import { ComponentRegistry } from '@/components/common/DynamicPage'

const MyComponent = () => <div>自定义组件</div>

ComponentRegistry.getInstance().register('MyComponent', {
  component: MyComponent,
  displayName: '自定义组件',
  description: '这是一个自定义组件'
})
```

## API 文档

### PageConfig

页面配置对象的类型定义：

```typescript
interface PageConfig {
  metadata: {
    title: string
    description?: string
    permissions?: {
      edit?: boolean
      print?: boolean
    }
  }
  layout: LayoutConfig
  content: ContentConfig[]
  state?: {
    initial?: Record<string, any>
    computed?: Record<string, string>
  }
}
```

### LayoutConfig

布局配置对象的类型定义：

```typescript
interface LayoutConfig {
  type: 'grid' | 'flex' | 'flow'
  grid?: GridConfig
  flex?: FlexConfig
  flow?: FlowConfig
}
```

## 最佳实践

1. 布局系统
   - 使用响应式配置
   - 避免深层嵌套
   - 合理使用间距

2. 组件管理
   - 及时注册组件
   - 使用异步加载
   - 添加错误处理

3. 性能优化
   - 使用 React.memo
   - 避免不必要的渲染
   - 合理使用缓存

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 发起 Pull Request

## 许可证

MIT