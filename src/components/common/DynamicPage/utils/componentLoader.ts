import React from 'react'
import type { ComponentType, ComponentMeta } from '../core/ComponentRegistry'

interface ComponentModule {
  default: ComponentType
  meta?: Omit<ComponentMeta, 'component'>
}

/**
 * 异步加载组件
 */
export const loadComponent = async (
  path: string
): Promise<ComponentType | null> => {
  try {
    const module = await import(path)
    return module.default
  } catch (error) {
    console.error(`Error loading component from ${path}:`, error)
    return null
  }
}

/**
 * 异步加载组件及其元数据
 */
export const loadComponentWithMeta = async (
  path: string
): Promise<ComponentMeta | null> => {
  try {
    const module: ComponentModule = await import(path)
    
    if (!module.default) {
      throw new Error(`Component not found in ${path}`)
    }
    
    return {
      component: module.default,
      ...module.meta
    }
  } catch (error) {
    console.error(`Error loading component with meta from ${path}:`, error)
    return null
  }
}

/**
 * 批量加载组件
 */
export const loadComponents = async (
  paths: string[]
): Promise<Record<string, ComponentType>> => {
  const components: Record<string, ComponentType> = {}
  
  await Promise.all(
    paths.map(async path => {
      const component = await loadComponent(path)
      if (component) {
        const name = path.split('/').pop()?.replace(/\.[jt]sx?$/, '') || path
        components[name] = component
      }
    })
  )
  
  return components
}

/**
 * 创建异步组件
 */
export const createAsyncComponent = (
  loader: () => Promise<ComponentType>
): ComponentType => {
  return React.lazy(async () => {
    const Component = await loader()
    return { default: Component }
  })
}

/**
 * 创建带有加载状态的异步组件
 */
export const createAsyncComponentWithLoading = (
  loader: () => Promise<ComponentType>,
  LoadingComponent?: ComponentType
): ComponentType => {
  const AsyncComponent = createAsyncComponent(loader)
  
  return (props: any) => (
    <React.Suspense fallback={LoadingComponent ? <LoadingComponent /> : null}>
      <AsyncComponent {...props} />
    </React.Suspense>
  )
}