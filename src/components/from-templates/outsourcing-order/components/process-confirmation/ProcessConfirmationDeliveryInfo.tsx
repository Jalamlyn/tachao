import React from "react"
import { motion } from "framer-motion"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"

interface ProcessConfirmationDeliveryInfoProps {
  form: UseFormReturn<any>
  step: string
  isEditable: boolean
}

const ProcessConfirmationDeliveryInfo: React.FC<ProcessConfirmationDeliveryInfoProps> = ({ form, step, isEditable }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className='mt-6 p-6 bg-gradient-to-br from-blue-50/50 to-blue-50/30 rounded-xl border border-blue-100/50 backdrop-blur-sm'
    >
      <h4 className='text-base font-semibold text-gray-800 mb-4 flex items-center gap-2'>
        <Icon icon='mdi:truck-delivery-outline' className='w-5 h-5 text-blue-500' />
        送货信息
      </h4>
      <div className='grid grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name={`data.processConfirmations.${step}.deliveryInfo.plateNumber`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700'>送货车牌号</FormLabel>
              <FormControl>
                <Input {...field} disabled={!isEditable} className='bg-white/80 backdrop-blur-sm' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`data.processConfirmations.${step}.deliveryInfo.driverName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-700'>司机姓名</FormLabel>
              <FormControl>
                <Input {...field} disabled={!isEditable} className='bg-white/80 backdrop-blur-sm' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`data.processConfirmations.${step}.deliveryInfo.driverContact`}
          render={({ field }) => (
            <FormItem className='col-span-2'>
              <FormLabel className='text-gray-700'>司机联系方式</FormLabel>
              <FormControl>
                <Input {...field} disabled={!isEditable} className='bg-white/80 backdrop-blur-sm' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  )
}

export default ProcessConfirmationDeliveryInfo