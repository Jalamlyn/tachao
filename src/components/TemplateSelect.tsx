import React from "react"
import { Select, SelectItem } from "@nextui-org/react"

interface Template {
  id: string
  title: string
  key?: string
  label?: string
}

interface TemplateSelectProps {
  templates: Template[]
  value: string | string[]
  onChange: (value: any) => void
  multiple?: boolean
  placeholder?: string
  className?: string
}

export const TemplateSelect: React.FC<TemplateSelectProps> = ({
  templates,
  value,
  onChange,
  multiple = false,
  placeholder = "选择数据来源",
  className,
}) => {
  const handleSelectionChange = (selection: any) => {
    if (multiple) {
      // 多选模式
      const selectedValues = Array.from(selection)
      onChange(selectedValues)
    } else {
      // 单选模式 - 保持向后兼容
      const selectedValue = Array.from(selection)[0]
      onChange(selectedValue)
    }
  }

  return (
    <Select
      items={templates}
      placeholder={placeholder}
      selectedKeys={multiple ? new Set(value) : new Set([value])}
      onSelectionChange={handleSelectionChange}
      className={className}
      selectionMode={multiple ? "multiple" : "single"}
    >
      {(template) => (
        <SelectItem key={template.id} value={template.id}>
          {template.title}
        </SelectItem>
      )}
    </Select>
  )
}