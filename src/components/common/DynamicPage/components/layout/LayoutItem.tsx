import React from 'react'
import { cn } from '@/lib/utils'
import type { LayoutItemConfig } from '../../types/layout'
import { createResponsiveClasses } from '../../utils/layout/classNames'

interface LayoutItemProps {
  config: LayoutItemConfig
  className?: string
  children?: React.ReactNode
}

/**
 * 布局项组件
 * 用于在布局中放置内容
 */
export const LayoutItem: React.FC<LayoutItemProps> = ({
  config,
  className,
  children
}) => {
  const generateItemClasses = () => {
    const classes: string[] = []
    
    // Grid 相关类名
    if (config.colSpan) {
      classes.push(...createResponsiveClasses('col-span', config.colSpan))
    }
    
    if (config.rowSpan) {
      classes.push(...createResponsiveClasses('row-span', config.rowSpan))
    }
    
    if (config.colStart) {
      classes.push(...createResponsiveClasses('col-start', config.colStart))
    }
    
    if (config.rowStart) {
      classes.push(...createResponsiveClasses('row-start', config.rowStart))
    }
    
    // Flex 相关类名
    if (config.grow) {
      classes.push(...createResponsiveClasses('flex-grow', config.grow))
    }
    
    if (config.shrink) {
      classes.push(...createResponsiveClasses('flex-shrink', config.shrink))
    }
    
    if (config.basis) {
      classes.push(...createResponsiveClasses('flex-basis', config.basis))
    }
    
    if (config.order) {
      classes.push(...createResponsiveClasses('order', config.order))
    }
    
    // 通用样式类名
    if (config.align) {
      classes.push(...createResponsiveClasses('self', config.align))
    }
    
    if (config.justify) {
      classes.push(...createResponsiveClasses('justify-self', config.justify))
    }
    
    if (config.padding) {
      classes.push(...createResponsiveClasses('p', config.padding))
    }
    
    if (config.margin) {
      classes.push(...createResponsiveClasses('m', config.margin))
    }
    
    return classes.join(' ')
  }
  
  return (
    <div className={cn(generateItemClasses(), config.className, className)}>
      {children}
    </div>
  )
}

export default LayoutItem