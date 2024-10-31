import React from "react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

interface ProcessConfirmationHeaderProps {
  title?: string
  description?: string
}

const ProcessConfirmationHeader: React.FC<ProcessConfirmationHeaderProps> = ({
  title = "处理确认",
  description = "跟踪并确认订单处理的每个环节",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='flex items-center gap-3 mb-4'
    >
      <div className='w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center'>
        <Icon icon='mdi:clipboard-check-outline' className='w-7 h-7 text-blue-600' />
      </div>
      <div>
        <h2 className='text-2xl font-semibold text-gray-900'>{title}</h2>
        <p className='text-gray-500 mt-1'>{description}</p>
      </div>
    </motion.div>
  )
}

export default ProcessConfirmationHeader