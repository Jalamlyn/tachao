import React from "react"
import { motion } from "framer-motion"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { EmptyStateProps } from "./types"

const EmptyState: React.FC<EmptyStateProps> = ({
  type = "no-data",
  icon,
  title,
  description,
  action,
  className = "",
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case "no-permission":
        return "mdi:lock"
      case "error":
        return "mdi:alert-circle"
      case "no-data":
      default:
        return "fluent:document-add-48-regular"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}
    >
      <div className='w-48 h-24 mb-8 relative flex justify-center items-center'>
        {icon || <Icon icon={getDefaultIcon()} className='w-full h-full text-primary/30' />}
      </div>
      <h3 className='text-xl font-medium text-foreground mb-2'>{title}</h3>
      {description && <p className='text-default-500 mb-8 text-center max-w-md'>{description}</p>}
      {action && (
        <Button color='secondary' size='lg' onClick={action.onClick}>
          {action.text}
        </Button>
      )}
    </motion.div>
  )
}

export default EmptyState
