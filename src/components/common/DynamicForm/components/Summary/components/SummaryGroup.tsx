import React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { SummaryGroup as SummaryGroupType } from "../../../types/summary"
import SummaryField from "./SummaryField"
import { UseFormReturn } from "react-hook-form"

interface SummaryGroupProps extends Omit<SummaryGroupType, 'values'> {
  form: UseFormReturn<any>
}

const SummaryGroup: React.FC<SummaryGroupProps> = ({
  title,
  icon,
  description,
  fields,
  layout = 'grid',
  columns = 3,
  form
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon && <Icon icon={icon} className="text-gray-400 w-5 h-5" />}
        <div className="min-w-0 flex-1"> {/* 添加 min-w-0 和 flex-1 确保标题可以正确换行 */}
          <h3 className="text-lg font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">{description}</p>
          )}
        </div>
      </div>
      
      <div className={cn(
        layout === 'grid' && `grid grid-cols-1 md:grid-cols-${columns} gap-4`,
        layout === 'flow' && 'flex flex-wrap gap-4',
        'min-w-0' // 确保网格容器可以正确处理溢出
      )}>
        {fields.map(field => (
          <div key={field.name} className="min-w-0 flex-1"> {/* 添加 min-w-0 和 flex-1 确保字段可以正确收缩 */}
            <SummaryField
              {...field}
              form={form}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SummaryGroup