import React from 'react'
import { Button, Input, Card } from '@nextui-org/react'
import { Layout, LayoutItem } from '../components/layout'

export type ComponentType = React.ComponentType<any>

export interface ComponentMeta {
  component: ComponentType
  displayName?: string
  description?: string
  defaultProps?: Record<string, any>
  propTypes?: Record<string, {
    type: string
    required?: boolean
    defaultValue?: any
  }>
}

export class ComponentRegistry {
  private static instance: ComponentRegistry
  private components: Map<string, ComponentMeta> = new Map()
  
  // 内置组件
  private builtinComponents: Record<string, ComponentType> = {
    Button,
    Input,
    Card,
    Layout,
    LayoutItem
  }
  
  private constructor() {
    // 注册内置组件
    Object.entries(this.builtinComponents).forEach(([name, component]) => {
      this.register(name, component)
    })
  }
  
  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry()
    }
    return ComponentRegistry.instance
  }
  
  /**
   * 注册组件
   */
  public register(
    name: string,
    componentOrMeta: ComponentType | ComponentMeta
  ): void {
    const meta: ComponentMeta = this.isComponentMeta(componentOrMeta)
      ? componentOrMeta
      : { component: componentOrMeta }
    
    this.components.set(name, meta)
  }
  
  /**
   * 批量注册组件
   */
  public registerBatch(components: Record<string, ComponentType | ComponentMeta>): void {
    Object.entries(components).forEach(([name, component]) => {
      this.register(name, component)
    })
  }
  
  /**
   * 获取组件
   */
  public get(name: string): ComponentMeta | undefined {
    return this.components.get(name)
  }
  
  /**
   * 获取所有已注册组件
   */
  public getAll(): Map<string, ComponentMeta> {
    return this.components
  }
  
  /**
   * 检查组件是否已注册
   */
  public has(name: string): boolean {
    return this.components.has(name)
  }
  
  /**
   * 注销组件
   */
  public unregister(name: string): void {
    this.components.delete(name)
  }
  
  /**
   * 清空所有注册的组件
   */
  public clear(): void {
    this.components.clear()
    // 重新注册内置组件
    Object.entries(this.builtinComponents).forEach(([name, component]) => {
      this.register(name, component)
    })
  }
  
  private isComponentMeta(value: any): value is ComponentMeta {
    return value && typeof value === 'object' && 'component' in value
  }
}

export default ComponentRegistry.getInstance()