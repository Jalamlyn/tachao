import React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/theme/cn"

interface BasicInputProps {
  type: string
  field: any
  className?: string
  placeholder?: string
}

const BasicInput: React.FC<BasicInputProps> = ({ 
  type, 
  field, 
  className,
  placeholder 
}) => (
  <Input 
    {...field} 
    type={type} 
    placeholder={placeholder}
    className={cn(
      type === "number" ? "text-right font-mono" : "",
      "w-full rounded-md",
      "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
      "transition-colors duration-200",
      "placeholder:text-gray-400",
      className
    )} 
  />
)

export default BasicInput