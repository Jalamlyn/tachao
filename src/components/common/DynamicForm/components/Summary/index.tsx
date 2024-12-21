import React from "react"
import { cn } from "@/theme/cn"
import { SummaryProps } from "../../types/summary"
import SummaryGroup from "./components/SummaryGroup"
import { UseFormReturn } from "react-hook-form"

interface ExtendedSummaryProps extends Omit<SummaryProps, 'values'> {
  form: UseFormReturn<any>
}

const Summary: React.FC<ExtendedSummaryProps> = ({
  groups,
  form,
  className,
  style
}) => {
  if (!groups?.length) return null
  return (
    <div 
      className={cn("space-y-8", className)}
      style={style}
    >
      {groups.map(group => (
        <SummaryGroup
          key={group.key}
          {...group}
          form={form}
        />
      ))}
    </div>
  )
}

export default Summary