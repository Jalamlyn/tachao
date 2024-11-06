import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import DynamicForm from "@/components/common/DynamicForm";
import type { DynamicFormConfig } from "@/components/common/DynamicForm/types";

interface FormPreviewProps {
  config: DynamicFormConfig | null;
}

const FormPreview: React.FC<FormPreviewProps> = ({ config }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {config ? (
        <div className="border rounded-lg p-6">
          <DynamicForm config={config} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Icon icon="mdi:form" className="w-12 h-12 mx-auto mb-4" />
          <p>请先生成或选择一个表单模板</p>
        </div>
      )}
    </motion.div>
  );
};

export default FormPreview;