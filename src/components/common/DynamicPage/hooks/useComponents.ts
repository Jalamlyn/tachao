import { useState, useEffect, useMemo } from 'react'
import ComponentRegistry, { ComponentType, ComponentMeta } from '../core/ComponentRegistry'

interface UseComponentsResult {
  components: Record<string, ComponentType>
  componentsMeta: Record<string, ComponentMeta>
  registerComponent: (name: string, component: ComponentType | ComponentMeta) => void
  unregisterComponent: (name: string) => void
  getComponent: (name: string) => ComponentType | undefined
  hasComponent: (name: string) => boolean
}

/**
 * 组件管理 Hook
 */
export const useComponents = (
  extraComponents?: Record<string, ComponentType | ComponentMeta>
): UseComponentsResult => {
  const registry = ComponentRegistry.getInstance()
  const [updateTrigger, setUpdateTrigger] = useState(0)
  
  // 注册额外的组件
  useEffect(() => {
    if (extraComponents) {
      registry.registerBatch(extraComponents)
      setUpdateTrigger(prev => prev + 1)
      
      // 清理函数
      return () => {
        Object.keys(extraComponents).forEach(name => {
          registry.unregister(name)
        })
      }
    }
  }, [extraComponents])
  
  // 获取所有组件
  const { components, componentsMeta } = useMemo(() => {
    const allComponents: Record<string, ComponentType> = {}
    const allMeta: Record<string, ComponentMeta> = {}
    
    registry.getAll().forEach((meta, name) => {
      allComponents[name] = meta.component
      allMeta[name] = meta
    })
    
    return {
      components: allComponents,
      componentsMeta: allMeta
    }
  }, [updateTrigger])
  
  const registerComponent = (name: string, component: ComponentType | ComponentMeta) => {
    registry.register(name, component)
    setUpdateTrigger(prev => prev + 1)
  }
  
  const unregisterComponent = (name: string) => {
    registry.unregister(name)
    setUpdateTrigger(prev => prev + 1)
  }
  
  const getComponent = (name: string) => {
    return registry.get(name)?.component
  }
  
  const hasComponent = (name: string) => {
    return registry.has(name)
  }
  
  return {
    components,
    componentsMeta,
    registerComponent,
    unregisterComponent,
    getComponent,
    hasComponent
  }
}

export default useComponents