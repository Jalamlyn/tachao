import React from "react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import "./styles.css"

export interface PageLayoutProps {
  title: string
  titleIcon?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, titleIcon, actions, children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`page-container ${className}`}
    >
      <div className='page-header'>
        <div className='page-title'>
          {titleIcon && <Icon icon={titleIcon} width={24} height={24} />}
          <h1>{title}</h1>
        </div>
        {actions && <div className='page-actions'>{actions}</div>}
      </div>
      <div className='page-content'>{children}</div>
    </motion.div>
  )
}

export default PageLayout