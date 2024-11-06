import React from "react";
import { Select, SelectItem } from "@nextui-org/react";
import { Icon } from "@iconify/react";

interface Template {
  id: string;
  title: string;
}

interface TemplateSelectProps {
  value: string;
  templates: Template[];
  onChange: (templateId: string) => void;
  className?: string;
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({
  value,
  templates,
  onChange,
  className,
}) => {
  return (
    <Select
      label="选择模板"
      placeholder="请选择模板"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      startContent={
        <Icon icon="mdi:file-document-outline" className="text-default-400" />
      }
    >
      <SelectItem
        key=""
        value=""
        startContent={
          <Icon icon="mdi:file-outline" className="text-default-400" />
        }
      >
        不使用模板
      </SelectItem>
      {templates.map((template) => (
        <SelectItem
          key={template.id}
          value={template.id}
          startContent={
            <Icon icon="mdi:file-document" className="text-default-400" />
          }
        >
          {template.title}
        </SelectItem>
      ))}
    </Select>
  );
};

export default TemplateSelect;