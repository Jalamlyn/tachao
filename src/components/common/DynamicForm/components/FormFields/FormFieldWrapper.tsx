import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { cn } from "@/theme/cn"
import { TooltipConfig } from "../../types"

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
  tooltip?: TooltipConfig
  children: (field: any) => React.ReactNode
  form: UseFormReturn<any>
  isEditable?: boolean
  disabled?: boolean
  showWhen?: {
    field: string
    value: any
    operator?: "eq" | "neq" | "gt" | "lt" | "contains"
  }
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  name,
  label,
  tooltip,
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
      case "neq":
        return dependentValue !== showWhen.value
      case "gt":
        return dependentValue > showWhen.value
      case "lt":
        return dependentValue < showWhen.value
      case "contains":
        return dependentValue?.includes?.(showWhen.value)
      case "eq":
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
            <div className="flex items-center gap-1">
              <FormLabel className="text-sm font-medium">{label}</FormLabel>
              {tooltip && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center justify-center rounded-full",
                        "w-4 h-4 text-gray-400 hover:text-gray-500",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      )}
                    >
                      <Icon icon="mdi:help-circle-outline" className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side={tooltip.placement || "top"}
                    className={cn(
                      "z-50 max-w-sm px-4 py-3",
                      "bg-white rounded-lg shadow-lg",
                      "border border-gray-200",
                      "text-sm text-gray-600 leading-relaxed"
                    )}
                  >
                    {typeof tooltip.content === 'string' ? (
                      <div className="whitespace-pre-wrap">{tooltip.content}</div>
                    ) : (
                      tooltip.content
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>
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