import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { LayoutItemConfig } from '../../types/layout'
import { createResponsiveClasses } from '../../utils/layout/classNames'

interface LayoutItemProps {
  config: LayoutItemConfig
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  animate?: boolean
  index?: number
}

/**
 * 布局项组件
 * 用于在布局中放置内容
 */
export const LayoutItem: React.FC<LayoutItemProps> = ({
  config,
  className,
  style,
  children,
  animate = true,
  index = 0
}) => {
  // 生成布局项类名
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
    
    if (config.area) {
      classes.push(`grid-area-[${config.area}]`)
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
  
  // 动画配置
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.1
      }
    }
  }
  
  // 包装内容
  const content = (
    <div
      className={cn(
        // 基础类名
        'relative',
        // 布局项类名
        generateItemClasses(),
        // 自定义类名
        config.className,
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
  
  // 如果启用动画,使用 motion.div 包装
  if (animate) {
    return (
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        {content}
      </motion.div>
    )
  }
  
  return content
}

export default LayoutItem