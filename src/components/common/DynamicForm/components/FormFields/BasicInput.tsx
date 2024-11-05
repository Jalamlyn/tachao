import React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/theme/cn"

interface BasicInputProps {
  type: string
  field: any
}

const BasicInput: React.FC<BasicInputProps> = ({ type, field }) => (
  <Input 
    {...field} 
    type={type} 
    className={cn(
      type === "number" ? "text-right font-mono" : "",
      "w-full rounded-md"
    )} 
  />
)

export default BasicInput