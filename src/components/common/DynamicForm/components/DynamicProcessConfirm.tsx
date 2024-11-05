import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { ProcessStep } from "../types"
import message from "@/components/Message"
import { getCurrentAccountInfo } from "@/service/apis/user"
import DynamicFormFields from "./DynamicFormFields"
import { cn } from "@/theme/cn"

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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isConfirming, setIsConfirming] = useState<string>("")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentAccountInfo()
        setCurrentUser(user)
      } catch (error) {
        console.error("Failed to fetch user info:", error)
        message.error("获取用户信息失败")
      }
    }

    if (!currentUser) {
      fetchUser()
    }
  }, [])

  useEffect(() => {
    const currentValues = form.getValues(fieldName) || {}
    const updates: Record<string, any> = {}
    let needsUpdate = false

    steps.forEach((step) => {
      if (!currentValues[step.key]) {
        updates[`${fieldName}.${step.key}`] = {
          confirmed: false,
          confirmer: "",
          confirmationDate: "",
          formData: {},
        }
        needsUpdate = true
      }
    })

    if (needsUpdate) {
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })
    }
  }, [steps, fieldName, form])

  const handleConfirm = async (step: ProcessStep) => {
    if (!currentUser) {
      message.error("未能获取用户信息")
      return
    }

    if (step.fields) {
      const formDataPath = `${fieldName}.${step.key}.formData`
      const isValid = await form.trigger(formDataPath)
      if (!isValid) {
        message.error("请完成必填字段")
        return
      }
    }

    setIsConfirming(step.key)
    try {
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: true,
        [`${fieldName}.${step.key}.confirmer`]: currentUser.name || currentUser.email,
        [`${fieldName}.${step.key}.confirmationDate`]: new Date().toISOString(),
      }

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })

      form.trigger(`${fieldName}.${step.key}`)
      message.success("确认成功")
    } catch (error) {
      console.error("Error confirming step:", error)
      message.error("确认失败")
    } finally {
      setIsConfirming("")
    }
  }

  const handleCancel = (step: ProcessStep) => {
    try {
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: false,
        [`${fieldName}.${step.key}.confirmer`]: "",
        [`${fieldName}.${step.key}.confirmationDate`]: "",
      }

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })

      form.trigger(`${fieldName}.${step.key}`)
      message.success("已取消确认")
    } catch (error) {
      console.error("Error canceling confirmation:", error)
      message.error("取消确认失败")
    }
  }

  return (
    <div className="space-y-6">
      {steps.map((step) => {
        const stepData = form.watch(`${fieldName}.${step.key}`) || {}
        const isConfirmed = stepData.confirmed
        const isLoading = isConfirming === step.key

        return (
          <Card key={step.key} className={cn(
            "border-l-4",
            isConfirmed ? "border-l-blue-500" : "border-l-gray-200"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isConfirmed 
                      ? "bg-blue-50 text-blue-600 ring-2 ring-blue-100" 
                      : "bg-gray-50 text-gray-400"
                  )}>
                    <Icon
                      icon={step.icon || (isConfirmed ? "mdi:check-circle" : "mdi:clock-outline")}
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      isConfirmed ? "text-blue-600" : "text-gray-900"
                    )}>
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-gray-500 mt-1 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {isEditable && (
                  <div>
                    {!isConfirmed ? (
                      <Button
                        onClick={() => handleConfirm(step)}
                        variant="bordered"
                        size="sm"
                        isLoading={isLoading}
                        className={cn(
                          "font-medium",
                          isLoading ? "opacity-70" : "hover:bg-blue-50 hover:text-blue-600"
                        )}
                        startContent={!isLoading && <Icon icon="mdi:check" className="w-4 h-4" />}
                      >
                        确认
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCancel(step)}
                        variant="bordered"
                        size="sm"
                        color="danger"
                        className="font-medium hover:bg-red-50"
                        startContent={<Icon icon="mdi:close" className="w-4 h-4" />}
                      >
                        取消确认
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {step.fields && (
                <div className={cn(
                  "mt-4 pt-4 border-t",
                  isConfirmed ? "opacity-70" : ""
                )}>
                  <DynamicFormFields
                    fields={step.fields}
                    form={form}
                    isEditable={isEditable && !isConfirmed}
                    orderNumberFieldConfig={undefined}
                  />
                </div>
              )}

              {isConfirmed && (
                <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t text-sm">
                  <div className="space-y-1">
                    <label className="text-gray-500">确认人</label>
                    <p className="font-medium text-gray-900">{stepData.confirmer}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500">确认时间</label>
                    <p className="font-medium text-gray-900">
                      {stepData.confirmationDate &&
                        format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")}
                    </p>
                  </div>
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