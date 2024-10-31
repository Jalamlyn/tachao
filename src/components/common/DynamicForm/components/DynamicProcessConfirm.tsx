import React from "react"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { ProcessStep } from "../types"
import DynamicFormFields from "./DynamicFormFields"

interface DynamicProcessConfirmProps {
  steps: ProcessStep[]
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
  const handleConfirm = async (step: ProcessStep) => {
    if (!step.onConfirm) return

    try {
      await step.onConfirm(form.getValues())
      form.setValue(`${fieldName}.${step.key}.confirmed`, true)
      form.setValue(`${fieldName}.${step.key}.confirmer`, "当前用户") // TODO: 获取当前用户
      form.setValue(`${fieldName}.${step.key}.confirmationDate`, new Date().toISOString())
    } catch (error) {
      console.error("Error confirming step:", error)
    }
  }

  const handleCancel = (step: ProcessStep) => {
    if (!step.onCancel) return

    try {
      step.onCancel()
      form.setValue(`${fieldName}.${step.key}.confirmed`, false)
      form.setValue(`${fieldName}.${step.key}.confirmer`, "")
      form.setValue(`${fieldName}.${step.key}.confirmationDate`, "")
    } catch (error) {
      console.error("Error canceling confirmation:", error)
    }
  }

  return (
    <div className='space-y-6'>
      {steps.map((step) => {
        const stepData = form.watch(`${fieldName}.${step.key}`) || {}
        const isConfirmed = stepData.confirmed

        return (
          <Card key={step.key}>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isConfirmed ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon icon={isConfirmed ? "mdi:check-circle" : "mdi:clock-outline"} className='w-7 h-7' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold'>{step.title}</h3>
                    {step.description && <p className='text-gray-500 mt-1'>{step.description}</p>}
                  </div>
                </div>

                {isEditable && (
                  <div>
                    {!isConfirmed ? (
                      <Button onClick={() => handleConfirm(step)} variant='outline' size='sm' className='gap-2'>
                        <Icon icon='mdi:check' className='w-4 h-4' />
                        确认
                      </Button>
                    ) : (
                      <Button onClick={() => handleCancel(step)} variant='outline' size='sm' className='gap-2'>
                        <Icon icon='mdi:close' className='w-4 h-4' />
                        取消确认
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {isConfirmed && (
                <div className='grid grid-cols-2 gap-6 mt-4'>
                  <div>
                    <label className='text-sm text-gray-500'>确认人</label>
                    <p>{stepData.confirmer}</p>
                  </div>
                  <div>
                    <label className='text-sm text-gray-500'>确认时间</label>
                    <p>
                      {stepData.confirmationDate && format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")}
                    </p>
                  </div>
                </div>
              )}

              {step.fields && (
                <div className='mt-6'>
                  <DynamicFormFields fields={step.fields} form={form} isEditable={isEditable && !isConfirmed} />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default DynamicProcessConfirm
