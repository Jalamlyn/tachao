import React from "react"
import { Icon } from "@iconify/react"

export interface PageLayoutProps {
  title: string
  titleIcon?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, titleIcon, actions, children, className = "" }) => {
  return (
    <div
      className={`w-full min-h-[calc(100vh-180px)] bg-background t-all duration-300 ease-in-out ${className}`}
    >
      <div className='flex justify-between items-center mb-3 md:flex-row flex-col md:items-center items-start md:gap-0 gap-4'>
        <div className='flex items-center gap-3 mt-2'>
          {titleIcon && <Icon icon={titleIcon} width={24} height={24} />}
          <h1 className='text-2xl font-semibold text-foreground m-0'>{title}</h1>
        </div>
        {actions && (
          <div className='flex items-center gap-2 md:w-auto w-full md:justify-start justify-end'>{actions}</div>
        )}
      </div>
      <div className='bg-content-background rounded-xl min-h-[calc(100vh-280px)]'>{children}</div>
    </div>
  )
}

export default PageLayout
