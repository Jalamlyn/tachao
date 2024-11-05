import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { ProcessStep as ProcessStepType } from "../../types"
import { UseFormReturn } from "react-hook-form"
import ProcessStepForm from "./ProcessStepForm"
import ProcessStepConfirmation from "./ProcessStepConfirmation"

interface ProcessStepProps {
  step: ProcessStepType
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName?: string
  isConfirming: boolean
  onConfirm: (step: ProcessStepType) => void
  onCancel: (step: ProcessStepType) => void
}

const ProcessStep: React.FC<ProcessStepProps> = ({
  step,
  form,
  isEditable = true,
  fieldName = "processConfirmations",
  isConfirming,
  onConfirm,
  onCancel,
}) => {
  const stepData = form.watch(`${fieldName}.${step.key}`) || {}
  const isConfirmed = stepData.confirmed
  const isLoading = isConfirming

  return (
    <Card
      className={cn(
        "border-l-4",
        isConfirmed ? "border-l-blue-500" : "border-l-gray-200"
      )}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                isConfirmed
                  ? "bg-blue-50 text-blue-600 ring-2 ring-blue-100"
                  : "bg-gray-50 text-gray-400"
              )}
            >
              <Icon
                icon={step.icon || (isConfirmed ? "mdi:check-circle" : "mdi:clock-outline")}
                className="w-5 h-5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-lg font-semibold break-all",
                  isConfirmed ? "text-blue-600" : "text-gray-900"
                )}
              >
                {step.title}
              </h3>
              {step.description && (
                <p className="text-gray-500 mt-1 text-sm leading-relaxed break-all">
                  {step.description}
                </p>
              )}
            </div>
          </div>

          {isEditable && (
            <div className="flex w-full md:w-auto">
              {!isConfirmed ? (
                <Button
                  onClick={() => onConfirm(step)}
                  variant="bordered"
                  size="sm"
                  isLoading={isLoading}
                  className={cn(
                    "font-medium w-full md:w-auto",
                    isLoading ? "opacity-70" : "hover:bg-blue-50 hover:text-blue-600"
                  )}
                  startContent={!isLoading && <Icon icon="mdi:check" className="w-4 h-4" />}
                >
                  <span className="hidden md:inline">确认</span>
                </Button>
              ) : (
                <Button
                  onClick={() => onCancel(step)}
                  variant="bordered"
                  size="sm"
                  color="danger"
                  className="font-medium hover:bg-red-50 w-full md:w-auto"
                  startContent={<Icon icon="mdi:close" className="w-4 h-4" />}
                >
                  <span className="hidden md:inline">取消确认</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 步骤表单 */}
        {step.fields && (
          <ProcessStepForm
            step={step}
            form={form}
            isEditable={isEditable}
            isConfirmed={isConfirmed}
            fieldName={fieldName}
          />
        )}

        {/* 确认信息 */}
        {isConfirmed && (
          <ProcessStepConfirmation
            confirmer={stepData.confirmer}
            confirmationDate={stepData.confirmationDate}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default ProcessStep