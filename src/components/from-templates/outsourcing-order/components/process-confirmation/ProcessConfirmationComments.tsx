import React from "react"
import { motion } from "framer-motion"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"

interface ProcessConfirmationCommentsProps {
  form: UseFormReturn<any>
  step: string
  isEditable: boolean
  isInitializing: boolean
  isConfirmed: boolean
}

const ProcessConfirmationComments: React.FC<ProcessConfirmationCommentsProps> = ({
  form,
  step,
  isEditable,
  isInitializing,
  isConfirmed,
}) => {
  const comments = form.watch(`data.processConfirmations.${step}.comments`)

  if (!isInitializing && isEditable) {
    return (
      <FormField
        control={form.control}
        name={`data.processConfirmations.${step}.comments`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-gray-700 flex items-center gap-2 my-2'>
              <Icon icon='mdi:comment-text-outline' className='w-5 h-5 text-blue-500' />
              确认意见
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                disabled={!isEditable}
                className='min-h-[100px] bg-white/80 backdrop-blur-sm resize-none'
                placeholder='请输入确认意见...'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  if (!isInitializing && !isEditable && isConfirmed && comments) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='mt-6'
      >
        <FormLabel className='text-gray-700 flex items-center gap-2 my-2'>
          <Icon icon='mdi:comment-text-outline' className='w-5 h-5 text-blue-500' />
          确认意见
        </FormLabel>
        <div className='p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg text-gray-700 font-medium border border-gray-100'>
          {comments}
        </div>
      </motion.div>
    )
  }

  return null
}

export default ProcessConfirmationComments