import React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { SummaryField as SummaryFieldType } from "../../../types/summary"
import { getDefaultFormatter } from "../utils/formatters"
import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { FormatterService } from "../../../utils/formatters"
import { Tooltip } from "@nextui-org/react"

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

  const renderValue = (value: any) => {
    const formattedValue = formatConfig
      ? FormatterService.format(value, formatConfig).formattedValue
      : legacyFormatter(value, precision)
    
    return (
      <Tooltip content={formattedValue}>
        <span
          className={cn(
            "text-xl font-bold",
            type === "amount" && "font-mono",
            "max-w-full overflow-hidden text-ellipsis whitespace-nowrap block"
          )}
          style={{
            ...style,
            ...(formatConfig && FormatterService.format(value, formatConfig).style),
          }}
        >
          {formattedValue}
        </span>
      </Tooltip>
    )
  }

  // 静态显示模式
  if (isStatic) {
    return (
      <div className={cn(
        "p-4 bg-gray-50 rounded-lg",
        "t-all duration-200",
        "hover:bg-gray-100",
        "min-w-0" // 确保flex子项可以正确收缩
      )}>
        <div className='text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap'>{label}</div>
        <div className='mt-1 flex items-center min-w-0'> {/* 添加 min-w-0 确保子元素可以正确收缩 */}
          {renderValue(defaultValue)}
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
            <div className={cn(
              "p-4 bg-gray-50 rounded-lg",
              "t-all duration-200",
              "hover:bg-gray-100",
              "min-w-0"
            )}>
              <div className='text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap'>{label}</div>
              <div className='mt-1 flex items-center min-w-0'>
                {renderValue(field.value ?? defaultValue)}
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