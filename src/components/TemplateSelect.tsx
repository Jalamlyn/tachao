import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFormCount } from "@/hooks/useFormCount"

interface TemplateSelectProps {
  templates: Array<{ id: string; title: string }>
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TemplateSelect({ templates, value, onChange, className }: TemplateSelectProps) {
  const { getFormCountByTemplate } = useFormCount()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-12 ${className}`}>
        <SelectValue placeholder="请选择表单类型" />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            <div className="flex justify-between items-center w-full">
              <span className="text-default-700">{template.title}</span>
              <span className="text-sm text-muted-foreground">
                {getFormCountByTemplate(template.id)} 张表单
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}