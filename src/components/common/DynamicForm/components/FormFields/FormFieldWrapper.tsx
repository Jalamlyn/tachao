import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { motion } from "framer-motion"

// 动画配置
const animations = {
  fieldVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
}

interface FormFieldWrapperProps {
  name: string
  label: string
  children: (field: any) => React.ReactNode
  form: UseFormReturn<any>
  isEditable?: boolean
  disabled?: boolean
  showWhen?: {
    field: string
    value: any
    operator?: 'eq' | 'neq' | 'gt' | 'lt' | 'contains'
  }
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  name,
  label,
  children,
  form,
  isEditable = true,
  disabled,
  showWhen,
}) => {
  // 处理条件显示逻辑
  const shouldShow = React.useMemo(() => {
    if (!showWhen) return true

    const dependentValue = form.watch(showWhen.field)
    
    switch (showWhen.operator) {
      case 'neq':
        return dependentValue !== showWhen.value
      case 'gt':
        return dependentValue > showWhen.value
      case 'lt':
        return dependentValue < showWhen.value
      case 'contains':
        return dependentValue?.includes?.(showWhen.value)
      case 'eq':
      default:
        return dependentValue === showWhen.value
    }
  }, [form, showWhen])

  if (!shouldShow) return null

  return (
    <motion.div variants={animations.fieldVariants} initial="hidden" animate="visible">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-sm font-medium">{label}</FormLabel>
            <FormControl>
              {children({ ...field, disabled: !isEditable || disabled })}
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </motion.div>
  )
}

export default FormFieldWrapper