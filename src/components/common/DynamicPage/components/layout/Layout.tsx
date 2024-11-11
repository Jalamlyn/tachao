import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { LayoutConfig } from '../../types/layout'
import { generateLayoutClasses } from '../../utils/layout/classNames'

interface LayoutProps {
  config: LayoutConfig
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  animate?: boolean
}

/**
 * 布局组件
 * 支持网格布局、弹性布局和流式布局
 */
export const Layout: React.FC<LayoutProps> = ({
  config,
  className,
  style,
  children,
  animate = true
}) => {
  // 生成布局类名
  const classes = generateLayoutClasses(config)
  
  // 动画配置
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }
  
  // 包装内容
  const content = (
    <div 
      className={cn(
        // 基础类名
        'relative w-full',
        // 布局类名
        classes.join(' '),
        // 自定义类名
        config.className,
        className
      )}
      style={{
        // 网格布局配置
        ...(config.type === 'grid' && config.grid?.templateAreas && {
          gridTemplateAreas: config.grid.templateAreas
        }),
        // 自定义样式
        ...style
      }}
    >
      {children}
    </div>
  )
  
  // 如果启用动画,使用 motion.div 包装
  if (animate) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {content}
      </motion.div>
    )
  }
  
  return content
}

export default Layout