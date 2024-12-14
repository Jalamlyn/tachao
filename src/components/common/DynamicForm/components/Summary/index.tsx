import React from "react"
import { cn } from "@/theme/cn"
import { SummaryProps } from "../../types/summary"
import SummaryGroup from "./components/SummaryGroup"

const Summary: React.FC<SummaryProps> = ({
  groups,
  values,
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
          values={values}
        />
      ))}
    </div>
  )
}

export default Summary