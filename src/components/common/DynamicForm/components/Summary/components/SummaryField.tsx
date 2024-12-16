import React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { SummaryField as SummaryFieldType } from "../../../types/summary"
import { getDefaultFormatter } from "../utils/formatters"
import { FormField, FormItem, FormControl } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"

interface SummaryFieldProps extends SummaryFieldType {
  form: UseFormReturn<any>
}

const SummaryField: React.FC<SummaryFieldProps> = ({
  label,
  name,
  type,
  trend,
  precision = 2,
  style,
  format,
  form,
}) => {
  const formatter = format || getDefaultFormatter(type)

  const renderTrend = () => {
    if (!trend) return null
    return (
      <Icon
        icon={`mdi:arrow-${trend}`}
        className={cn("ml-2", trend === "up" && "text-red-500", trend === "down" && "text-green-500", "w-4 h-4")}
      />
    )
  }
  console.log(formatter(form.getValues(name), precision))
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
                <span className={cn("text-xl font-bold", type === "amount" && "font-mono")} style={style}>
                  {formatter(field.value, precision)}
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
