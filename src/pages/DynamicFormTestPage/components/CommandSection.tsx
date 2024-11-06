import React from "react";
import { motion } from "framer-motion";
import CommandInput from "@/components/CommandInput";
import TemplateSelect from "./TemplateSelect";

interface Template {
  id: string;
  title: string;
}

interface CommandSectionProps {
  disabled: boolean;
  selectedTemplate: string;
  templates: Template[];
  onCommand: (command: string) => void;
  onTemplateChange: (templateId: string) => void;
  className?: string;
}

const CommandSection: React.FC<CommandSectionProps> = ({
  disabled,
  selectedTemplate,
  templates,
  onCommand,
  onTemplateChange,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 ${className}`}
    >
      <TemplateSelect
        value={selectedTemplate}
        templates={templates}
        onChange={onTemplateChange}
      />

      <CommandInput
        disabled={disabled}
        onCommand={onCommand}
      />
    </motion.div>
  );
};

export default CommandSection;