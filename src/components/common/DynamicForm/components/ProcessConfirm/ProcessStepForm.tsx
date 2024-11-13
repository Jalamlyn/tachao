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

  return (
    <motion.div
      className={cn(
        "mt-4 pt-4 border-t border-gray-100",
        "transition-all duration-300",
        isConfirmed ? "opacity-70 hover:opacity-100" : "",
        "rounded-lg"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <DynamicFormFields
          fields={step.fields}
          form={form}
          isEditable={isEditable && !isConfirmed}
          orderNumberFieldConfig={undefined}
        />
      </motion.div>
    </motion.div>
  )
}

export default ProcessStepForm