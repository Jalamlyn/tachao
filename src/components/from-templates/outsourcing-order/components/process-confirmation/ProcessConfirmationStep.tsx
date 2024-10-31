import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { format } from "date-fns"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { PROCESS_STEP_DESCRIPTIONS } from "../../types/OutsourcingOrder"

interface ProcessConfirmationStepProps {
  step: string
  stepLabel: string
  form: UseFormReturn<any>
  isEditable: boolean
  onConfirm: (step: string) => void
  onCancelConfirmation: (step: string) => void
}

const ProcessConfirmationStep: React.FC<ProcessConfirmationStepProps> = ({
  step,
  stepLabel,
  form,
  isEditable,
  onConfirm,
  onCancelConfirmation,
}) => {
  const confirmation = form.watch(`data.processConfirmations.${step}`) || {}
  const isConfirmed = confirmation?.confirmed

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='initial'
      animate='animate'
      exit='exit'
      className={cn(
        "p-8 rounded-2xl transition-all duration-300",
        "hover:shadow-lg hover:shadow-blue-500/5",
        isConfirmed
          ? "bg-gradient-to-br from-blue-50/80 to-blue-50/40 border border-blue-100/50"
          : "bg-white border border-gray-100"
      )}
    >
      <div className='flex justify-between items-start'>
        <motion.div className='flex items-center gap-4 mb-2' variants={itemVariants}>
          <motion.div
            animate={{
              scale: isConfirmed ? [1, 1.2, 1] : 1,
              rotate: isConfirmed ? [0, 15, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              times: isConfirmed ? [0, 0.6, 1] : [0],
            }}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "shadow-sm transition-colors duration-300",
              isConfirmed ? "bg-blue-100/80 text-blue-600" : "bg-gray-100/80 text-gray-400"
            )}
          >
            <Icon icon={isConfirmed ? "mdi:check-circle" : "mdi:clock-outline"} className='w-7 h-7' />
          </motion.div>
          <div>
            <motion.h3 variants={itemVariants} className='text-xl font-semibold text-gray-900'>
              {stepLabel}
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className={cn(
                "text-sm mt-1 transition-colors duration-300",
                isConfirmed ? "text-blue-600" : "text-gray-500"
              )}
            >
              {isConfirmed ? "已确认" : "待确认"}
            </motion.p>
          </div>
        </motion.div>

        {isEditable && (
          <div className='flex gap-2'>
            <AnimatePresence mode='wait'>
              {!isConfirmed ? (
                <motion.div
                  key='confirm'
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={() => onConfirm(step)}
                    variant='outline'
                    size='sm'
                    type='button'
                    className='gap-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 hover:border-blue-300 text-blue-700
                      transition-all duration-300 hover:scale-105'
                  >
                    <Icon icon='mdi:check' className='w-4 h-4' />
                    确认
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key='cancel'
                  initial={{ opacity: 0, scale: 0.9, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={() => onCancelConfirmation(step)}
                    variant='outline'
                    size='sm'
                    type='button'
                    className='gap-2 border-red-200 bg-red-50/50 hover:bg-red-100/50 hover:border-red-300 text-red-700
                      transition-all duration-300 hover:scale-105'
                  >
                    <Icon icon='mdi:close' className='w-4 h-4' />
                    取消确认
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <motion.p variants={itemVariants} className='mt-4 text-gray-600 text-sm leading-relaxed'>
        {PROCESS_STEP_DESCRIPTIONS[step]}
      </motion.p>

      <motion.div variants={itemVariants} className='mt-8 space-y-6'>
        <div className='grid grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name={`data.processConfirmations.${step}.confirmer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-gray-700 flex items-center gap-2'>
                  <Icon icon='mdi:account' className='w-5 h-5 text-blue-500' />
                  确认人
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled className='bg-gray-50/80 backdrop-blur-sm' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`data.processConfirmations.${step}.confirmationDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-gray-700 flex items-center gap-2'>
                  <Icon icon='mdi:calendar' className='w-5 h-5 text-blue-500' />
                  确认日期
                </FormLabel>
                <FormControl>
                  <Input
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd HH:mm") : ""}
                    disabled
                    className='bg-gray-50/80 backdrop-blur-sm font-mono'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProcessConfirmationStep
