import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import type { PageMetadata } from '../../types/page'

interface PageProps {
  metadata: PageMetadata
  toolbar?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onEdit?: () => void
  onPrint?: () => void
  children?: React.ReactNode
}

/**
 * 基础页面组件
 */
export const Page: React.FC<PageProps> = ({
  metadata,
  toolbar,
  className,
  style,
  onEdit,
  onPrint,
  children
}) => {
  const { title, description, permissions } = metadata
  
  return (
    <div className={cn(
      "page-container min-h-screen bg-gray-50 p-4 md:p-6",
      className
    )} style={style}>
      {/* 页面头部 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-gray-500">{description}</p>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          {permissions?.print && (
            <Button
              variant="flat"
              color="primary"
              onClick={onPrint}
              className="w-full md:w-auto"
              startContent={<Icon icon="mdi:printer" className="w-4 h-4" />}
            >
              <span className="hidden md:inline">打印</span>
            </Button>
          )}
          
          {permissions?.edit && (
            <Button
              variant="flat"
              color="primary"
              onClick={onEdit}
              className="w-full md:w-auto"
              startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
            >
              <span className="hidden md:inline">编辑</span>
            </Button>
          )}
          
          {toolbar}
        </div>
      </div>
      
      {/* 页面内容 */}
      <div className="page-content">
        {children}
      </div>
    </div>
  )
}

export default Page