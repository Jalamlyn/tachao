import React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { SummaryField as SummaryFieldType } from "../../../types/summary"
import { getDefaultFormatter } from "../utils/formatters"
import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { FormatterService } from "../../../utils/formatters"

interface SummaryFieldProps extends SummaryFieldType {
  form: UseFormReturn<any>
  defaultValue?: any
  static?: boolean
}

const SummaryField: React.FC<SummaryFieldProps> = ({
  label,
  name,
  type,
  trend,
  precision = 2,
  style,
  format,
  formatConfig,
  form,
  defaultValue,
  static: isStatic,
}) => {
  // 保留原有的格式化器以保持向后兼容
  debugger
  const legacyFormatter = format || getDefaultFormatter(type)

  const renderTrend = () => {
    if (!trend) return null
    return (
      <Icon
        icon={`mdi:arrow-${trend}`}
        className={cn("ml-2", trend === "up" && "text-red-500", trend === "down" && "text-green-500", "w-4 h-4")}
      />
    )
  }

  // 静态显示模式
  if (isStatic) {
    return (
      <div className={cn("p-4 bg-gray-50 rounded-lg", "transition-all duration-200", "hover:bg-gray-100")}>
        <div className='text-sm text-gray-500'>{label}</div>
        <div className='mt-1 flex items-center'>
          <span
            className={cn("text-xl font-bold", type === "amount" && "font-mono")}
            style={{
              ...style,
              ...(formatConfig && FormatterService.format(defaultValue, formatConfig).style),
            }}
          >
            {formatConfig
              ? FormatterService.format(defaultValue, formatConfig).formattedValue
              : legacyFormatter(defaultValue, precision)}
          </span>
          {renderTrend()}
        </div>
      </div>
    )
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className={cn("p-4 bg-gray-50 rounded-lg", "transition-all duration-200", "hover:bg-gray-100")}>
              <div className='text-sm text-gray-500'>{label}</div>
              <div className='mt-1 flex items-center'>
                <span
                  className={cn("text-xl font-bold", type === "amount" && "font-mono")}
                  style={{
                    ...style,
                    ...(formatConfig && FormatterService.format(field.value ?? defaultValue, formatConfig).style),
                  }}
                >
                  {formatConfig
                    ? FormatterService.format(field.value ?? defaultValue, formatConfig).formattedValue
                    : legacyFormatter(field.value ?? defaultValue, precision)}
                </span>
                {renderTrend()}
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  )
}

export default SummaryField