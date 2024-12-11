import React from "react"
import { UseFormReturn } from "react-hook-form"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/theme/cn"
import { TooltipConfig, FieldStyle } from "../../types"

// 动画配置
const tooltipAnimation = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
  transition: { duration: 0.15, ease: "easeOut" },
}

interface FormFieldWrapperProps {
  name: string
  label: string
  tooltip?: TooltipConfig
  children: (field: any) => React.ReactNode
  form: UseFormReturn<any>
  isEditable?: boolean
  disabled?: boolean
  required?: boolean
  showWhen?: {
    field: string
    value: any
    operator?: "eq" | "neq" | "gt" | "lt" | "contains"
  }
  style?: FieldStyle
  layout?: "default" | "full-width" | "inline"
  className?: string
  customStyle?: React.CSSProperties
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  name,
  label,
  tooltip,
  children,
  form,
  isEditable = true,
  disabled,
  required,
  style,
  layout,
  className,
  customStyle
}) => {
  // 处理样式配置
  const getStyles = () => {
    const baseStyles: React.CSSProperties = {}
    
    if (style) {
      // 基础样式
      if (style.width) baseStyles.width = style.width
      if (style.height) baseStyles.height = style.height
      if (style.padding) baseStyles.padding = style.padding
      if (style.margin) baseStyles.margin = style.margin
      if (style.display) baseStyles.display = style.display
      if (style.textAlign) baseStyles.textAlign = style.textAlign
      
      // 合并自定义样式
      if (style.custom) {
        Object.assign(baseStyles, style.custom)
      }
    }

    // 合并组件级自定义样式
    if (customStyle) {
      Object.assign(baseStyles, customStyle)
    }

    return baseStyles
  }

  // 处理className
  const getClassName = () => {
    const classes = [
      'form-field-wrapper',
      className,
      layout === 'full-width' && 'col-span-full',
      style?.colSpan && `col-span-${style.colSpan}`,
      // 响应式类名
      style?.sm && Object.entries(style.sm).map(([key, value]) => `sm:${key}-${value}`),
      style?.md && Object.entries(style.md).map(([key, value]) => `md:${key}-${value}`),
      style?.lg && Object.entries(style.lg).map(([key, value]) => `lg:${key}-${value}`)
    ]
    
    return cn(...classes.filter(Boolean))
  }

  return (
    <motion.div variants={tooltipAnimation} initial='hidden' animate='visible'>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className='w-full'>
            <div className='flex items-center gap-1'>
              <FormLabel className='text-sm font-medium text-primary-500'>
                {label}
                {required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>
              {tooltip && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      className={cn(
                        "inline-flex items-center justify-center rounded-full",
                        "w-4 h-4 text-gray-400 hover:text-gray-500",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                        "transition-colors duration-200"
                      )}
                    >
                      <Icon icon='mdi:help-circle-outline' className='w-4 h-4' />
                    </button>
                  </PopoverTrigger>
                  <AnimatePresence>
                    <PopoverContent
                      side={tooltip.placement || "top"}
                      className={cn(
                        "z-50 max-w-sm px-4 py-3",
                        "bg-white rounded-lg shadow-lg",
                        "border border-gray-200",
                        "text-sm text-gray-600 leading-relaxed"
                      )}
                      asChild
                    >
                      <motion.div {...tooltipAnimation}>
                        {typeof tooltip.content === "string" ? (
                          <div className='whitespace-pre-wrap'>{tooltip.content}</div>
                        ) : (
                          tooltip.content
                        )}
                      </motion.div>
                    </PopoverContent>
                  </AnimatePresence>
                </Popover>
              )}
            </div>
            <FormControl>
              <div className={getClassName()} style={getStyles()}>
                {children({ ...field, disabled: !isEditable || disabled })}
              </div>
            </FormControl>
            <FormMessage className='text-xs' />
          </FormItem>
        )}
      />
    </motion.div>
  )
}

export default FormFieldWrapper