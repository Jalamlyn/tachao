import React from "react"
import { format } from "date-fns"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { motion } from "framer-motion"

interface ProcessStepConfirmationProps {
  confirmer: string
  confirmationDate: string
}

const ProcessStepConfirmation: React.FC<ProcessStepConfirmationProps> = ({
  confirmer,
  confirmationDate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 pt-4 border-t border-blue-100">
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="text-gray-500 flex items-center gap-2 text-sm">
          <Icon icon="mdi:account" className="w-4 h-4" />
          确认人
        </label>
        <p className={cn(
          "font-medium text-gray-900 pl-6",
          "transition-all duration-300",
          "hover:text-blue-600"
        )}>
          {confirmer}
        </p>
      </motion.div>

      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <label className="text-gray-500 flex items-center gap-2 text-sm">
          <Icon icon="mdi:clock" className="w-4 h-4" />
          确认时间
        </label>
        <p className={cn(
          "font-medium text-gray-900 pl-6",
          "transition-all duration-300",
          "hover:text-blue-600"
        )}>
          {confirmationDate &&
            format(new Date(confirmationDate), "yyyy-MM-dd HH:mm:ss")}
        </p>
      </motion.div>
    </div>
  )
}

export default ProcessStepConfirmation