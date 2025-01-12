import React from "react"
import { UseFormReturn } from "react-hook-form"
import { cn } from "@/theme/cn"
import DynamicFormFields from "../DynamicFormFields"
import { ProcessStep } from "../../types"
import { motion } from "framer-motion"

interface ProcessStepFormProps {
  step: ProcessStep
  form: UseFormReturn<any>
  isEditable?: boolean
  isConfirmed?: boolean
  fieldName?: string
}

const ProcessStepForm: React.FC<ProcessStepFormProps> = ({
  step,
  form,
  isEditable = true,
  isConfirmed = false,
  fieldName = "processConfirmations",
}) => {
  if (!step.fields) return null

  // 添加字段值变化处理函数
  const handleFieldChange = (field: string, value: any) => {
    // 使用正确的路径格式设置表单值
    const formDataPath = `${fieldName}.${step.key}.formData.${field}`
    form.setValue(formDataPath, value)
  }

  return (
    <motion.div
      className={cn(
        "mt-4 pt-4 border-t border-gray-100",
        "t-all duration-300",
        isConfirmed ? "opacity-70 hover:opacity-100" : "",
        "rounded-lg"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      <motion.div
        initial='hidden'
        animate='visible'
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <DynamicFormFields
          fields={step.fields}
          form={form}
          isEditable={isEditable && !isConfirmed}
          onChange={handleFieldChange}
        />
      </motion.div>
    </motion.div>
  )
}

export default ProcessStepForm
