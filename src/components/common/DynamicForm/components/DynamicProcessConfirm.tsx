import React, { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { ProcessStep } from "../types"
import DynamicFormFields from "./DynamicFormFields"
import message from "@/components/Message"

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
  // 添加状态初始化
  useEffect(() => {
    // 检查并初始化每个步骤的状态
    const currentValues = form.getValues(fieldName) || {}
    const updates: Record<string, any> = {}
    let needsUpdate = false

    steps.forEach((step) => {
      if (!currentValues[step.key]) {
        updates[`${fieldName}.${step.key}`] = {
          confirmed: false,
          confirmer: "",
          confirmationDate: "",
          comments: ""
        }
        needsUpdate = true
      }
    })

    // 只在需要时进行批量更新
    if (needsUpdate) {
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false
        })
      })
    }
  }, [steps, fieldName, form])

  const handleConfirm = async (step: ProcessStep) => {
    if (!step.onConfirm) return

    try {
      // 验证步骤
      if (step.validations) {
        const errors: string[] = []
        for (const rule of step.validations.rules) {
          const error = rule(form.getValues())
          if (error) {
            errors.push(error)
          }
        }
        if (errors.length > 0) {
          message.error(errors.join('\n'))
          return
        }
      }

      // 执行确认操作
      await step.onConfirm(form.getValues())

      // 批量更新确认状态
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: true,
        [`${fieldName}.${step.key}.confirmer`]: "当前用户",
        [`${fieldName}.${step.key}.confirmationDate`]: new Date().toISOString()
      }

      // 使用批量更新并确保触发重新渲染
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
      })

      // 执行确认后的更新操作
      if (step.onConfirm.updates) {
        step.onConfirm.updates.forEach(({ field, value }) => {
          const finalValue = typeof value === 'function' ? value(form.getValues()) : value
          form.setValue(field, finalValue)
        })
      }

      // 执行确认后的计算
      if (step.onConfirm.calculations) {
        step.onConfirm.calculations.forEach(({ field, formula }) => {
          const calculatedValue = formula(form.getValues())
          form.setValue(field, calculatedValue)
        })
      }

      // 强制触发重新渲染
      form.trigger(`${fieldName}.${step.key}`)

      message.success('确认成功')
    } catch (error) {
      console.error("Error confirming step:", error)
      message.error('确认失败')
    }
  }

  const handleCancel = (step: ProcessStep) => {
    if (!step.onCancel) return

    try {
      step.onCancel()
      
      // 批量更新取消状态
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: false,
        [`${fieldName}.${step.key}.confirmer`]: "",
        [`${fieldName}.${step.key}.confirmationDate`]: "",
        [`${fieldName}.${step.key}.comments`]: ""
      }

      // 使用批量更新并确保触发重新渲染
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
      })

      // 强制触发重新渲染
      form.trigger(`${fieldName}.${step.key}`)

      message.success('已取消确认')
    } catch (error) {
      console.error("Error canceling confirmation:", error)
      message.error('取消确认失败')
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
                    <Icon icon={step.icon || (isConfirmed ? "mdi:check-circle" : "mdi:clock-outline")} className='w-7 h-7' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold'>{step.title}</h3>
                    {step.description && <p className='text-gray-500 mt-1'>{step.description}</p>}
                  </div>
                </div>

                {isEditable && (
                  <div>
                    {!isConfirmed ? (
                      <Button
                        onClick={() => handleConfirm(step)}
                        variant="bordered"
                        size="sm"
                        startContent={<Icon icon='mdi:check' className='w-4 h-4' />}
                      >
                        {step.confirmation?.confirmButtonText || '确认'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCancel(step)}
                        variant="bordered"
                        size="sm"
                        color="danger"
                        startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                      >
                        {step.confirmation?.cancelButtonText || '取消确认'}
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

              {step.confirmation?.requireComments && (
                <div className='mt-4'>
                  <label className='text-sm text-gray-500'>{step.confirmation.commentLabel || '确认意见'}</label>
                  <textarea
                    className='w-full mt-1 p-2 border rounded-md'
                    value={stepData.comments || ''}
                    onChange={(e) => form.setValue(`${fieldName}.${step.key}.comments`, e.target.value)}
                    disabled={!isEditable || isConfirmed}
                  />
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