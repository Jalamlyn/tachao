import React, { useState, useCallback, createContext, useContext } from 'react'
import type { PageConfig, PageContext, ContentConfig } from '../../types/page'
import { Layout } from '../layout/Layout'
import { Page } from './Page'

// 创建页面上下文
const pageContext = createContext<PageContext>({
  state: {},
  setState: () => {},
  computed: {}
})

interface PageRendererProps {
  config: PageConfig
  components: Record<string, React.ComponentType<any>>
  onEdit?: () => void
  onPrint?: () => void
}

/**
 * 内容渲染器
 */
const ContentRenderer: React.FC<{
  content: ContentConfig
  components: Record<string, React.ComponentType<any>>
}> = ({ content, components }) => {
  const { state } = useContext(pageContext)
  
  // 检查条件渲染
  if (content.showWhen) {
    const { field, value, operator = 'eq' } = content.showWhen
    const fieldValue = state[field]
    
    switch (operator) {
      case 'neq':
        if (fieldValue === value) return null
        break
      case 'gt':
        if (!(fieldValue > value)) return null
        break
      case 'lt':
        if (!(fieldValue < value)) return null
        break
      case 'contains':
        if (!fieldValue?.includes?.(value)) return null
        break
      default:
        if (fieldValue !== value) return null
    }
  }
  
  if (content.type === 'container') {
    return (
      <Layout 
        config={content.layout}
        className={content.className}
        style={content.style}
      >
        {content.children?.map((child, index) => (
          <ContentRenderer
            key={index}
            content={child}
            components={components}
          />
        ))}
      </Layout>
    )
  }
  
  const Component = components[content.type]
  if (!Component) {
    console.warn(`Component ${content.type} not found`)
    return null
  }
  
  return (
    <Component
      {...content.props}
      className={content.className}
      style={content.style}
    >
      {content.children?.map((child, index) => (
        <ContentRenderer
          key={index}
          content={child}
          components={components}
        />
      ))}
    </Component>
  )
}

/**
 * 页面渲染器
 */
export const PageRenderer: React.FC<PageRendererProps> = ({
  config,
  components,
  onEdit,
  onPrint
}) => {
  // 状态管理
  const [state, setState] = useState(config.state?.initial || {})
  
  // 计算属性
  const computed = Object.entries(config.state?.computed || {}).reduce(
    (acc, [key, formula]) => {
      try {
        acc[key] = new Function('state', `return ${formula}`)(state)
      } catch (error) {
        console.error(`Error computing ${key}:`, error)
        acc[key] = undefined
      }
      return acc
    },
    {} as Record<string, any>
  )
  
  // 状态更新函数
  const handleSetState = useCallback((key: string, value: any) => {
    setState(prev => ({ ...prev, [key]: value }))
  }, [])
  
  return (
    <pageContext.Provider value={{
      state,
      setState: handleSetState,
      computed
    }}>
      <Page
        metadata={config.metadata}
        onEdit={onEdit}
        onPrint={onPrint}
      >
        <Layout config={config.layout}>
          {config.content.map((content, index) => (
            <ContentRenderer
              key={index}
              content={content}
              components={components}
            />
          ))}
        </Layout>
      </Page>
    </pageContext.Provider>
  )
}

export default PageRenderer