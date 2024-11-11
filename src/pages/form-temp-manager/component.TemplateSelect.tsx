import React from "react";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface Template {
  id: string;
  title: string;
}

interface TemplateSelectProps {
  value: string;
  templates: Template[];
  onChange: (templateId: string) => void;
  className?: string;
  isLoading?: boolean;
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({
  value,
  templates,
  onChange,
  className,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Select
        label="选择模板"
        placeholder="请选择模板"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        startContent={
          <Icon 
            icon="mdi:file-document-outline" 
            className="text-default-400"
          />
        }
        endContent={isLoading && (
          <Spinner 
            size="sm"
            classNames={{
              wrapper: "w-4 h-4"
            }}
          />
        )}
        isDisabled={isLoading}
        classNames={{
          trigger: "h-12 data-[hover=true]:bg-default-100 transition-colors duration-200",
          value: "text-default-700",
          label: "text-default-600",
          innerWrapper: "gap-2",
          listbox: "p-2",
          popoverContent: "min-w-[200px]"
        }}
      >
        <SelectItem
          key=""
          value=""
          startContent={
            <Icon 
              icon="mdi:file-outline" 
              className="text-default-400 w-5 h-5"
            />
          }
          className="data-[hover=true]:bg-default-100 transition-colors duration-200"
        >
          不使用模板
        </SelectItem>
        {templates.map((template) => (
          <SelectItem
            key={template.id}
            value={template.id}
            startContent={
              <Icon 
                icon="mdi:file-document" 
                className="text-default-400 w-5 h-5"
              />
            }
            className="data-[hover=true]:bg-default-100 transition-colors duration-200"
          >
            {template.title}
          </SelectItem>
        ))}
      </Select>
    </motion.div>
  );
};

export default TemplateSelect;