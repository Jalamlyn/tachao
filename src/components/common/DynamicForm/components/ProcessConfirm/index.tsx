import React from "react"
import { UseFormReturn } from "react-hook-form"
import { ProcessStep as ProcessStepType } from "../../types"
import { useProcessConfirm } from "./hooks/useProcessConfirm"
import ProcessStep from "./ProcessStep"

interface DynamicProcessConfirmProps {
  steps: ProcessStepType[]
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName?: string
}

const DynamicProcessConfirm: React.FC<DynamicProcessConfirmProps> = ({
  steps,
  form,
  isEditable = true,
  fieldName = "processConfirmations",
}) => {
  const { isConfirming, handleConfirm, handleCancel } = useProcessConfirm({
    steps,
    form,
    fieldName,
    isEditable,
  })

  return (
    <div className='space-y-6'>
      {steps.map((step) => (
        <ProcessStep
          key={step.key}
          step={step}
          form={form}
          isEditable={isEditable}
          fieldName={fieldName}
          isConfirming={isConfirming === step.key}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ))}
    </div>
  )
}

export default DynamicProcessConfirm
