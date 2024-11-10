import React from 'react'
import { cn } from '@/lib/utils'
import type { LayoutConfig } from '../../types/layout'
import { generateLayoutClasses } from '../../utils/layout/classNames'

interface LayoutProps {
  config: LayoutConfig
  className?: string
  children?: React.ReactNode
}

/**
 * 布局组件
 * 支持网格布局、弹性布局和流式布局
 */
export const Layout: React.FC<LayoutProps> = ({
  config,
  className,
  children
}) => {
  const classes = generateLayoutClasses(config)
  
  return (
    <div className={cn(classes.join(' '), config.className, className)}>
      {children}
    </div>
  )
}

export default Layout