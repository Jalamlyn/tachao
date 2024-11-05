import React from "react"
import { UseFormReturn } from "react-hook-form"
import { cn } from "@/theme/cn"
import DynamicFormFields from "../../DynamicFormFields"
import { ProcessStep } from "../../../types"

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
    <div
      className={cn(
        "mt-4 pt-4 border-t",
        isConfirmed ? "opacity-70" : ""
      )}
    >
      <DynamicFormFields
        fields={step.fields}
        form={form}
        isEditable={isEditable && !isConfirmed}
        orderNumberFieldConfig={undefined}
      />
    </div>
  )
}

export default ProcessStepForm