import React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { SummaryGroup as SummaryGroupType } from "../../../types/summary"
import SummaryField from "./SummaryField"

interface SummaryGroupProps extends SummaryGroupType {
  values: Record<string, any>
}

const SummaryGroup: React.FC<SummaryGroupProps> = ({
  title,
  icon,
  description,
  fields,
  layout = 'grid',
  columns = 3,
  values
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon && <Icon icon={icon} className="text-gray-400 w-5 h-5" />}
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      
      <div className={cn(
        layout === 'grid' && `grid grid-cols-1 md:grid-cols-${columns} gap-4`,
        layout === 'flow' && 'flex flex-wrap gap-4'
      )}>
        {fields.map(field => (
          <SummaryField
            key={field.name}
            {...field}
            value={values[field.name]}
          />
        ))}
      </div>
    </div>
  )
}

export default SummaryGroup