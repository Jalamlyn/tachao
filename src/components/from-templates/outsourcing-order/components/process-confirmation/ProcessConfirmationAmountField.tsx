import React from "react"
import { motion } from "framer-motion"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"

interface ProcessConfirmationAmountFieldProps {
  form: UseFormReturn<any>
  step: string
  isEditable: boolean
  fieldName: string
  label: string
  icon: string
}

const ProcessConfirmationAmountField: React.FC<ProcessConfirmationAmountFieldProps> = ({
  form,
  step,
  isEditable,
  fieldName,
  label,
  icon,
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove leading zeros and non-numeric characters
    let value = e.target.value.replace(/^0+(?=\d)/, '').replace(/[^\d.]/g, '')
    
    // Handle decimal points
    const decimalCount = (value.match(/\./g) || []).length
    if (decimalCount > 1) {
      value = value.replace(/\./g, (match, index, string) => 
        index === string.indexOf('.') ? match : ''
      )
    }
    
    // Limit to 2 decimal places
    const parts = value.split('.')
    if (parts[1]?.length > 2) {
      value = `${parts[0]}.${parts[1].slice(0, 2)}`
    }

    // Update the form
    form.setValue(`data.processConfirmations.${step}.${fieldName}`, value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className='mt-6'
    >
      <FormField
        control={form.control}
        name={`data.processConfirmations.${step}.${fieldName}`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-gray-700 flex items-center gap-2'>
              <Icon icon={icon} className='w-5 h-5 text-blue-500' />
              {label}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                onChange={handleAmountChange}
                disabled={!isEditable}
                className='bg-white/80 backdrop-blur-sm font-mono text-right'
                prefix='¥'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  )
}

export default ProcessConfirmationAmountField