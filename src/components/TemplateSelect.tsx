import React from "react"
import { Select, SelectItem } from "@nextui-org/react"
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
    <Select
      label="选择表单类型"
      placeholder="请选择表单类型" 
      selectedKeys={value ? [value] : []}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      classNames={{
        base: "max-w-full",
        trigger: "h-12",
      }}
    >
      {templates.map((template) => (
        <SelectItem key={template.id} value={template.id}>
          <div className="flex justify-between items-center w-full">
            <span className="text-default-700">{template.title}</span>
            <span className="text-small text-default-400">
              {getFormCountByTemplate(template.id)} 张表单
            </span>
          </div>
        </SelectItem>
      ))}
    </Select>
  )
}