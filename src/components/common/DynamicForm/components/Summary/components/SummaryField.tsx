import React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { SummaryField as SummaryFieldType } from "../../../types/summary"
import { getDefaultFormatter } from "../utils/formatters"

interface SummaryFieldProps extends SummaryFieldType {
  value: any
}

const SummaryField: React.FC<SummaryFieldProps> = ({
  label,
  value,
  type,
  trend,
  precision = 2,
  style,
  format
}) => {
  const formatter = format || getDefaultFormatter(type)
  
  const renderTrend = () => {
    if (!trend) return null
    return (
      <Icon 
        icon={`mdi:arrow-${trend}`}
        className={cn(
          'ml-2',
          trend === 'up' && 'text-red-500',
          trend === 'down' && 'text-green-500',
          'w-4 h-4'
        )}
      />
    )
  }

  return (
    <div className={cn(
      "p-4 bg-gray-50 rounded-lg",
      "transition-all duration-200",
      "hover:bg-gray-100"
    )}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 flex items-center">
        <span 
          className={cn(
            "text-xl font-bold",
            type === 'amount' && 'font-mono'
          )} 
          style={style}
        >
          {formatter(value, precision)}
        </span>
        {renderTrend()}
      </div>
    </div>
  )
}

export default SummaryField